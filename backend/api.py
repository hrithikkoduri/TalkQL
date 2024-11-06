from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from requests import request
from sql_agent import SQLAgent
from typing import Optional, Dict
from fastapi.middleware.cors import CORSMiddleware  # Add this import
import sqlite3
import json


app = FastAPI()
sql_agent = SQLAgent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DatabaseConnection(BaseModel):
    db_type: str
    connection_params: Dict[str, str]

class Query(BaseModel):
    query: str

class QueryResponse(BaseModel):
    query_result: str
    query_used: str

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
            return {
                "is_connected": True,
                "db_type": db_type,
                "database_name": params.get('database') or params.get('db_path') or 'Database'
            }
        return {
            "is_connected": False,
            "db_type": None,
            "database_name": None
        }
    except Exception as e:
        print(f"Error checking connection: {str(e)}")
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
        query_result, query_used = sql_agent.graph_workflow(query.query)
        return QueryResponse(
            query_result=query_result,
            query_used=query_used
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)