from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from requests import request
from sql_agent import SQLAgent
from visualization_agent import VisualizationAgent
from typing import Optional, Dict
from fastapi.middleware.cors import CORSMiddleware  # Add this import
import sqlite3
import json
from langchain_openai import ChatOpenAI
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI()
sql_agent = SQLAgent()
viz_agent = VisualizationAgent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

class DatabaseConnection(BaseModel):
    db_type: str
    connection_params: Dict[str, str]

class Query(BaseModel):
    query: str
    vizEnabled: bool = Field(default=True, description="Whether visualization should be generated")
    tabularMode: bool = Field(default=False, description="Whether to display results in tabular format")

class QueryResponse(BaseModel):
    query_result: str
    query_used: str
    viz_result: Optional[str] = None

class isSingularResponse(BaseModel):
    is_singular: bool = Field(
        ..., description="Whether the query result is singular in nature i.e. a single datapoint or has multiple datapoints")

def init_connection_store():
    conn = sqlite3.connect('connection_store.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS connections
                 (id INTEGER PRIMARY KEY, db_type TEXT, connection_params TEXT)''')
    conn.commit()
    conn.close()

@app.get("/check-connection")
async def check_connection():
    try:
        conn = sqlite3.connect('db_store.sqlite')
        cursor = conn.cursor()
        cursor.execute('SELECT db_type, connection_params FROM connections LIMIT 1')
        result = cursor.fetchone()
        conn.close()

        if result:
            db_type, connection_params = result
            params = json.loads(connection_params)
            
            # Reinitialize the SQL agent connection
            try:
                sql_agent.add_db(
                    db_type=db_type,
                    **params
                )
                sql_agent.get_db()  # Initialize the database connection
                
                return {
                    "is_connected": True,
                    "db_type": db_type,
                    "database_name": params.get('database') or params.get('db_path') or 'Database'
                }
            except Exception as e:
                logger.error(f"Error reinitializing database connection: {str(e)}")
                return {
                    "is_connected": False,
                    "db_type": None,
                    "database_name": None
                }
        return {
            "is_connected": False,
            "db_type": None,
            "database_name": None
        }
    except Exception as e:
        logger.error(f"Error checking connection: {str(e)}")
        return {
            "is_connected": False,
            "db_type": None,
            "database_name": None
        }

@app.post("/disconnect-database")
async def disconnect_database():
    try:
        conn = sqlite3.connect('db_store.sqlite')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM connections')
        conn.commit()
        conn.close()
        return {"message": "Successfully disconnected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/add-database")
async def add_database(connection: DatabaseConnection):
    try:
        # First try to connect using sql_agent
        sql_agent.add_db(
            db_type=connection.db_type,
            **connection.connection_params
        )
        
        # If connection successful, store the connection info
        conn = sqlite3.connect('db_store.sqlite')
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS connections (
                id INTEGER PRIMARY KEY,
                db_type TEXT,
                connection_params TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Clear existing connections
        cursor.execute('DELETE FROM connections')
        
        # Store the new connection
        cursor.execute(
            'INSERT INTO connections (db_type, connection_params) VALUES (?, ?)',
            (connection.db_type, json.dumps(connection.connection_params))
        )
        conn.commit()
        conn.close()

        return {"message": "Database connected successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/query", response_model=QueryResponse)
async def execute_query(query: Query):
    try:
        # Check if database connection is lost and reconnect if necessary
        if not sql_agent.db:
            conn = sqlite3.connect('db_store.sqlite')
            cursor = conn.cursor()
            cursor.execute('SELECT db_type, connection_params FROM connections LIMIT 1')
            result = cursor.fetchone()
            conn.close()
            
            if result:
                db_type, connection_params = result
                params = json.loads(connection_params)
                sql_agent.add_db(db_type=db_type, **params)
                sql_agent.get_db()
            else:
                raise HTTPException(
                    status_code=400,
                    detail="No database connection established"
                )
            
        viz_result = None
        # Log before the operation
        logger.info(f"Received query: {query.query}")
        logger.info(f"Visualization enabled: {query.vizEnabled}")
        
        # Modify query if tabular mode is enabled
        processed_query = f"{query.query} Provide result in tabular format" if query.tabularMode else query.query
        logger.info(f"Processed query with tabular mode {query.tabularMode}: {processed_query}")
        
        # Execute query with modified or original query
        query_result, query_used = sql_agent.graph_workflow(processed_query)
        
        logger.info(f"Query executed. Result: {query_result[:100]}...")
        
        # Only check for singularity if visualization is enabled
        if query.vizEnabled:
            try:
                is_singular = llm.with_structured_output(isSingularResponse).invoke(query_result)
                logger.info(f"Singularity check: {is_singular}")
                
                # Only generate visualization if vizEnabled is True and result is not singular
                if not is_singular.is_singular:
                    logger.info("Query result is not singular, generating visualization...")
                    viz_result = viz_agent.graph_workflow(query_result)
                    logger.info(f"Visualization generated: {viz_result[:100] if viz_result else 'None'}...")
                else:
                    logger.info("Query result is singular, skipping visualization")
            except Exception as e:
                logger.error(f"Error in singularity check: {str(e)}")
        else:
            logger.info("Visualization disabled, skipping visualization generation")
        
        # Return response with or without visualization
        return QueryResponse(
            query_result=query_result,
            query_used=query_used,
            viz_result=viz_result if viz_result and viz_result.startswith('data:image') else None
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)