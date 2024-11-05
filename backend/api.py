from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sql_agent import SQLAgent
from typing import Optional, Dict
from fastapi.middleware.cors import CORSMiddleware  # Add this import


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

@app.post("/add-database")
async def add_database(connection: DatabaseConnection):
    try:
        sql_agent.add_db(
            db_type=connection.db_type,
            **connection.connection_params
        )
        return {"message": f"{connection.db_type} database connected successfully"}
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