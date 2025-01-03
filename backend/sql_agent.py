import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import requests
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_core.tools import Tool
from langchain_core.prompts import ChatPromptTemplate
from typing import Annotated
from langchain_core.messages import AIMessage, HumanMessage 
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing_extensions import TypedDict
from langgraph.graph import END, StateGraph, START
from langgraph.graph.message import AnyMessage, add_messages
from langchain_community.utilities import SQLDatabase
import pandas as pd
import sqlite3
import tempfile


load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

class Tables(BaseModel):
    tables: list[str] = Field(..., description="The list of tables")

class State(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]

class DBQuery(BaseModel):
    query: str = Field(..., description="The SQL query to execute")


class OptimizedQuery(BaseModel):
    query: str = Field(..., description="The optimized SQL query to execute")
    

# Describe a tool to represent the end state
class SubmitFinalAnswer(BaseModel):
    """ Submit the final answer to the user based on the query result."""
    final_answer: str = Field(...,description = "The final answer to the user")

class SQLAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", temperature = 0)
        self.db = None
        self.list_tables_tool = None
        self.get_schema_tool = None
        self.db_query_tool = None
        self.query_check = None
        self.db_uri = None


    
    def add_db(self, db_type: str, **connection_params):
        """
        Set up database connection based on the database type
        
        Args:
            db_type: Type of database (sqlite, mysql, postgresql, mssql, snowflake, csv)
            connection_params: Database connection parameters
        """
        if db_type.lower() == "sqlite":
            url = connection_params.get("url")
            db_name = "downloaded_database.db"
            if url:
                response = requests.get(url)
                if response.status_code == 200:
                    with open(db_name, "wb") as f:
                        f.write(response.content)
                    self.db_uri = f"sqlite:///{db_name}"
                else:
                    raise Exception(f"Failed to download the database. Status code: {response.status_code}")
            else:
                db_path = connection_params.get("db_path", db_name)
                self.db_uri = f"sqlite:///{db_path}"
        
        elif db_type.lower() == "mysql":
            user = connection_params.get("user", "root")
            password = connection_params.get("password", "")
            host = connection_params.get("host", "localhost")
            port = connection_params.get("port", "3306")
            database = connection_params.get("database")
            if not database:
                raise ValueError("Database name is required for MySQL")
            self.db_uri = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        
        elif db_type.lower() == "postgresql":
            user = connection_params.get("user", "postgres")
            password = connection_params.get("password", "")
            host = connection_params.get("host", "localhost")
            port = connection_params.get("port", "5432")
            database = connection_params.get("database")
            if not database:
                raise ValueError("Database name is required for PostgreSQL")
            self.db_uri = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        
        elif db_type.lower() in ["mssql", "sqlserver"]:
            user = connection_params.get("user")
            password = connection_params.get("password")
            host = connection_params.get("host", "localhost")
            port = connection_params.get("port", "1433")
            database = connection_params.get("database")
            driver = connection_params.get("driver", "ODBC Driver 17 for SQL Server")
            
            if not all([user, password, database]):
                raise ValueError("User, password, and database are required for MS SQL Server")
            
            # Format for MS SQL Server connection string
            self.db_uri = f"mssql+pyodbc://{user}:{password}@{host}:{port}/{database}?driver={driver.replace(' ', '+')}"
        
        elif db_type.lower() == "snowflake":
            account = connection_params.get("account")
            user = connection_params.get("user")
            password = connection_params.get("password")
            warehouse = connection_params.get("warehouse")
            database = connection_params.get("database")
            schema = connection_params.get("schema")
            
            if not all([account, user, password, warehouse, database, schema]):
                raise ValueError("All fields are required for Snowflake connection")
                
            self.db_uri = f"snowflake://{user}:{password}@{account}/{database}/{schema}?warehouse={warehouse}"
        
        elif db_type.lower() == "csv":
            file_path = connection_params.get("file_path")
            url = connection_params.get("url")
            delimiter = connection_params.get("delimiter", ",")
            
            try:
                if file_path:
                    df = pd.read_csv(file_path, delimiter=delimiter)
                elif url:
                    # Add headers to ensure we get CSV content
                    headers = {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'text/csv,application/csv,text/plain'
                    }
                    response = requests.get(url, headers=headers)
                    
                    if 'text/html' in response.headers.get('content-type', '').lower():
                        raise ValueError("URL returned HTML content instead of CSV data")
                    
                    # Save content to temporary file
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp:
                        tmp.write(response.content)
                        file_path = tmp.name
                    
                    df = pd.read_csv(file_path, delimiter=delimiter)
                else:
                    raise ValueError("Either file_path or url is required for CSV connection")
                
                # Create SQLite database from CSV
                df.to_sql("csv_data", sqlite3.connect("csv_database.db"), 
                         if_exists="replace", index=False)
                self.db_uri = "sqlite:///csv_database.db"
                
            except Exception as e:
                raise ValueError(f"Failed to process CSV: {str(e)}")
        
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    
    def get_db(self):
        if not self.db_uri:
            raise ValueError("Database URI not set. Please call add_db first.")
        self.db = SQLDatabase.from_uri(self.db_uri)
    
    def define_tools(self):

        toolkit = SQLDatabaseToolkit(db = self.db, llm = self.llm)
        tools = toolkit.get_tools()

        #To get tables  
        self.list_tables_tool = next(tool for tool in tools if tool.name == "sql_db_list_tables")
        #To get schema
        self.get_schema_tool = next(tool for tool in tools if tool.name == "sql_db_schema")
        #To execute query
        self.db_query_tool = Tool(
            name = "db_query_tool",
            description = "Execute the SQL query against the database and get back the result. If the query is not correct, an error will be returned. If error is returned, reqwrite the query, check the query and try again.",
            func = self.db_query,
            args_schema = DBQuery
        )

    def db_query(self, query: str) -> str:
        """ 
        Execute the SQL query against the database and get back the result.
        If the query is not correct, an error will be returned.
        If error is returned, reqrite the query, check the query and try again.
        
        """
        print("--------------------------------Executing db query tool--------------------------------")
        print("--------------------------------")
        print(query)
        print("--------------------------------")
        result = self.db.run_no_throw(query)
        print("--------------------------------DB query tool executed--------------------------------")
        # Format the result into a readable string
        if isinstance(result, str):
            return result
        else:
        # Convert the result to a formatted string
            return result.to_string() if hasattr(result, 'to_string') else str(result)
        
    def get_all_tables(self, state: State):
        """
        List all the tables in the database.
        """
        messages = state["messages"]
        print(f"Messages in get all tables: {messages}")
        print("--------------------------------Getting all tables--------------------------------")
        all_tables = self.list_tables_tool.invoke("")
        print(all_tables)
        print("--------------------------------All tables retrieved--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{all_tables}")]}
    
    def get_schema_for_all_tables(self, state: State):
        """
        Get the schema for all the tables
        """
        print(f"Messages in get schema for all tables: {state['messages']}")
        print("--------------------------------Getting schema for all tables--------------------------------")
        print(state["messages"][-1].content)
        relevant_tables_schema = self.get_schema_tool.invoke(state["messages"][-1].content)
        print(relevant_tables_schema)
        print("--------------------------------Schema for all tables retrieved--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{relevant_tables_schema}")]}
    
    def generate_query(self, state: State):
        """
        Generate a query based on the user's query and the schema of the tables
        """
        messages = state["messages"]
        print(f"Messages in generate query: {messages}")
        print("--------------------------------Generating query--------------------------------")
        generate_query_system = """ 
         You are a SQL expert that generates precise SQL queries based on user questions.
            
            You will be provided with state messages in placeholder which contains:
            1. The user's question
            2. All the tables in the database
            3. The complete schema information for those tables
            
            IMPORTANT STEPS:
            1. Analyze the provided schema information carefully
            2. Pay special attention to:
            - Primary and foreign keys for joins
            - Column names and data types
            - Relationships between tables
            3. Generate a SQL query that:
            - Uses the correct column names as shown in the schema
            - Properly joins tables using the correct keys
            - Includes appropriate WHERE clauses for filtering
            - If the user's question is about a specific time period, include a date filter in the query
            - If the user's question is about a specific value, include a filter for that value in the query
            - Uses proper aggregation functions when needed
            
            Remember to:
            - Always verify column names exist in the schema before using them
            - Use appropriate JOIN conditions based on the foreign key relationships
            - Include proper date formatting for date-related queries
            - Consider NULL handling where appropriate
            
            Return only the SQL query, nothing else.
        
        """
        generate_query_prompt = ChatPromptTemplate.from_messages([
            ("system", generate_query_system),
            ("placeholder", "{messages}")
        ])
        formatted_generate_query_prompt = generate_query_prompt.invoke({"messages":messages})  # Format the prompt
        generate_query_llm = self.llm.with_structured_output(DBQuery)
        generate_query_result = generate_query_llm.invoke(formatted_generate_query_prompt)
        print("--------------------------------")
        print(generate_query_result.query)
        print("--------------------------------Query generated--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{generate_query_result.query}")]}

    def correct_and_optimize_query(self, state: State):
        """
        Correct and optimize the query
        """
        messages = state["messages"]
        print(f"Messages in correct and optimize query: {messages}")
        print("--------------------------------Correcting and optimizing query--------------------------------")
        sql_query = messages[-1].content
        correct_and_optimize_query_system = """
        You are a SQL expert who corrects and optimizes SQL queries. 
        Your job is to find any issues with the query and correct them.
        You will also need to optimize the query for better performance. Try to make the query more efficient by reducing the number of joins, using appropriate indexes, and minimizing data retrieval. But make sure the results of the optimized query are still the same as the original query.
        If the user's question doesn't specify the number of results, restrict the number of results to top 10 using LIMIT 10 and mention that only top 10 results are shown in the comment.
        
        You will be provided with the state messages in placeholder which contains:
        1. The user's question
        2. All the tables in the database
        3. The complete schema information for those tables
        4. The SQL query that was generated

        Return only the SQL query with the comment, nothing else.
        """

        correct_and_optimize_query_prompt = ChatPromptTemplate.from_messages([
            ("system", correct_and_optimize_query_system),
            ("placeholder", "{messages}")
        ])
        formatted_correct_and_optimize_query_prompt = correct_and_optimize_query_prompt.invoke({"messages":messages})  # Format the prompt
        correct_and_optimize_query_llm = self.llm.with_structured_output(OptimizedQuery)
        correct_and_optimize_query_result = correct_and_optimize_query_llm.invoke(formatted_correct_and_optimize_query_prompt)
        print("--------------------------------Correct and optimize query result--------------------------------")
        print(correct_and_optimize_query_result.query)
        print("--------------------------------Query corrected and optimized--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{correct_and_optimize_query_result.query}")]}
    
    
    
    def execute_query(self, state: State):
        """
        Execute the query against the database
        """
        
        print("--------------------------------Executing query--------------------------------")
        execute_query_system = """ 
        You are a helpful assistant who is a SQL expert that executes SQL queries against the database.
        
        You will be given the SQL query to execute and its results.
        Analyze the results and provide a clear, human-readable response.
        Include both the final answer and the query used in your response.
        """
        
        sql_query = state["messages"][-1].content
        print("--------------------------------")
        print(f"Executing query: \n")
        print(sql_query)
        print("--------------------------------")

        # Execute the query and get results
        results = self.db_query_tool.invoke({"query": sql_query})
        print(results)
        print("--------------------------------Query executed--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{results}")]}
    
    def submit_final_answer(self, state: State):
        """
        Submit the final answer to the user
        """
        submit_final_answer_system = """You are a helpful assistant who can clearly and concisely format the results of a SQL query into a human-readable answer.
        The state messages in placeholder contains:
                1. The user's query
                2. The SQL query that was used to generate the results
                3. The results of the SQL query
                4. Additional comment regarding the query results
        
        Only if the query contains 'Provide result in tabular format', format the results in tabular format.
        Otherwise, format the results clearly using regular text formatting and concisely to minimize any amount of whitespace.
        Use proper markdown, highlighting and formatting to make the results more readable, informative and intuitive.
        """


        submit_final_answer_prompt = ChatPromptTemplate.from_messages([
            ("system", submit_final_answer_system),
            ("placeholder", "{messages}")
        ])
        messages = state["messages"]    
        formatted_submit_final_answer_prompt = submit_final_answer_prompt.invoke({"messages":messages})  # Format the prompt
        submit_final_answer_llm = self.llm.with_structured_output(SubmitFinalAnswer)
        submit_final_answer_result = submit_final_answer_llm.invoke(formatted_submit_final_answer_prompt)
        print(submit_final_answer_result.final_answer)
        print("--------------------------------Final answer submitted--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{submit_final_answer_result.final_answer}")]}
    
    def graph_workflow(self, user_query: str):
        self.get_db()
        self.define_tools()
        

        workflow = StateGraph(State)
        workflow.add_node("get_all_tables", self.get_all_tables)
        workflow.add_node("get_schema_for_all_tables", self.get_schema_for_all_tables)
        workflow.add_node("generate_query", self.generate_query)
        workflow.add_node("correct_and_optimize_query", self.correct_and_optimize_query)
        workflow.add_node("execute_query", self.execute_query)
        workflow.add_node("submit_final_answer", self.submit_final_answer)

        workflow.add_edge(START, "get_all_tables")
        workflow.add_edge("get_all_tables", "get_schema_for_all_tables")
        workflow.add_edge("get_schema_for_all_tables", "generate_query")
        workflow.add_edge("generate_query", "correct_and_optimize_query")
        workflow.add_edge("correct_and_optimize_query", "execute_query")
        workflow.add_edge("execute_query", "submit_final_answer")
        workflow.add_edge("submit_final_answer", END)
        app = workflow.compile()

        response = app.invoke({"messages": [HumanMessage(content = user_query)]})
        print("--------------------------------Final response--------------------------------")
        query_result = response["messages"][-1].content
        query_used = response["messages"][-3].content

        return query_result, query_used
        

if __name__ == "__main__":
    agent = SQLAgent()
    agent.add_db("sqlite", url = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db")
    query_result, query_used = agent.graph_workflow("Led Zeppelin's vs Queen's total sales and number of tracks sold in every year")
    print(query_result)
    print(query_used)