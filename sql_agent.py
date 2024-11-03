import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import requests
from langchain_core.messages import ToolMessage
from langchain_core.runnables import RunnableLambda, RunnableWithFallbacks
from langgraph.prebuilt import ToolNode
from typing import Any
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_core.tools import tool, Tool
from langchain_core.prompts import ChatPromptTemplate
from typing import Annotated, Literal

from langchain_core.messages import AIMessage, HumanMessage
from langchain_openai import ChatOpenAI

from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from langgraph.graph import END, StateGraph, START
from langgraph.graph.message import AnyMessage, add_messages

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

class Tables(BaseModel):
    tables: list[str] = Field(..., description="The list of tables")
class State(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]

class DBQuery(BaseModel):
    query: str = Field(..., description="The SQL query to execute")

class ExamineQuery(BaseModel):
    result: str = Field(..., description="The result of examining the query. Answer with either Rewrite, Extend or Correct")
    

# Describe a tool to represent the end state
class SubmitFinalAnswer(BaseModel):
    """ Submit the final answer to the user based on the query result."""
    final_answer: str = Field(...,description = "The final answer to the user")

class SQLAgentTest:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", temperature = 0)
        self.db = None
        self.list_tables_tool = None
        self.get_schema_tool = None
        self.db_query_tool = None
        self.query_check = None

    def db_connect(self):
        url = "https://storage.googleapis.com/benchmarks-artifacts/chinook/Chinook.db"

        response = requests.get(url)

        if response.status_code == 200:
            with open("Chinook.db", "wb") as f:
                f.write(response.content)
        else:
            print(f"Failed to download the database. Status code: {response.status_code}")
        from langchain_community.utilities import SQLDatabase

        self.db = SQLDatabase.from_uri("sqlite:///Chinook.db")

    def create_tool_node_with_fallback(self, tools:list) -> RunnableWithFallbacks[Any, dict]:
        """ 
        Create a tool node with fallback to handle errors and surface them to the agent.
        """
        return ToolNode(tools).with_fallbacks(
            [RunnableLambda(self.handle_tool_error)], exception_key = "error"
        )

    def handle_tool_error(self, state) -> dict:
        error = state.get("error")
        tool_calls = state["messages"][-1].tool_calls
        return {
            "messages": [
                ToolMessage(
                    content = f"An error occurred: {error}",
                    tool_call_id = tc["id"],
                )
                for tc in tool_calls
            ]
        }
    
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
        all_tables_prompt = ChatPromptTemplate.from_messages([
            ("system", "List all the tables in the database"),
            ("placeholder", "{messages}")
        ])
        all_tables_llm = self.llm.with_structured_output(Tables)
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
        generate_query_llm = self.llm.with_structured_output(DBQuery)
        generate_query_result = generate_query_llm.invoke(messages)
        print(generate_query_result)
        print("--------------------------------Query generated--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{generate_query_result.query}")]}
    
    def examine_query(self, state: State):
        """
        Correct the query if it is not syntactically correct
        """
        print("--------------------------------Examining query--------------------------------")
        print(f"Messages in examine query: {state['messages']}")
        messages = state["messages"]

        correct_query_system = """ 
        You are a helpful assistant who is a SQL expert that examines SQL queries to check if they are syntactically correct and if they take into account all the relevant tables and columns that are needed to answer the user's question.

        In the state messages in placeholder, you will find:
        1. The user's question
        2. All the tables in the database
        3. The complete schema information for those tables
        4. The SQL query that was generated

        If you think the query is incorrect, since it is syntactically incorrect, you should output as "Rewrite"
        If you think the query is incorrect because it is not taking into account all the relevant tables and columns that are needed to answer the user's question, you should output as "Extend"
        If the query is correct, you should output as "Correct"
        """

        examine_query_llm = self.llm.with_structured_output(ExamineQuery)
        examine_query_result = examine_query_llm.invoke(messages)
        print(examine_query_result)
        print("--------------------------------Query examined--------------------------------")
        return {"messages": state["messages"]}
    
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
        submit_final_answer_system = """ 
        You are a helpful assistan who can clearly and concisely format the results of a SQL query into a human-readable answer.

        The state messages in placeholder contains:
        1. The user's query
        1. The SQL query that was used to generate the results
        2. The results of the SQL query

        Your job is to format the results in a way that is easy to understand and read. Use the SubmitFinalAnswer schema to format the results.
        """
        submit_final_answer_prompt = ChatPromptTemplate.from_messages([
            ("system", submit_final_answer_system),
            ("placeholder", "{messages}")
        ])
        submit_final_answer_llm = self.llm.with_structured_output(SubmitFinalAnswer)
        submit_final_answer_result = submit_final_answer_llm.invoke(state["messages"])
        print(submit_final_answer_result)
        print("--------------------------------Final answer submitted--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{submit_final_answer_result.final_answer}")]}
    
    def main(self):
        self.db_connect()
        self.define_tools()
        

        workflow = StateGraph(State)
        workflow.add_node("get_all_tables", self.get_all_tables)
        workflow.add_node("get_schema_for_all_tables", self.get_schema_for_all_tables)
        workflow.add_node("generate_query", self.generate_query)
        workflow.add_node("execute_query", self.execute_query)
        workflow.add_node("submit_final_answer", self.submit_final_answer)
        workflow.add_node("examine_query", self.examine_query)

        workflow.add_edge(START, "get_all_tables")
        workflow.add_edge("get_all_tables", "get_schema_for_all_tables")
        workflow.add_edge("get_schema_for_all_tables", "generate_query")
        workflow.add_edge("generate_query", "examine_query")
        workflow.add_edge("examine_query", "execute_query")
        workflow.add_edge("execute_query", "submit_final_answer")
        workflow.add_edge("submit_final_answer", END)
        app = workflow.compile()

        response = app.invoke({"messages": [HumanMessage(content = "Top 10 artists with highest number of unsold tracks")]})
        print("--------------------------------Final response--------------------------------")
        query_result = response["messages"][-1].content
        query_used = response["messages"][-3].content

        print(query_used)
        print(query_result)
        

if __name__ == "__main__":
    agent = SQLAgentTest()
    agent.main()