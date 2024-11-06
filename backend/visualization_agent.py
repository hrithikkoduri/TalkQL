from langchain_experimental.utilities import PythonREPL
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph, START
from typing import Annotated, TypedDict
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph.message import AnyMessage, add_messages
from typing import Sequence
from pydantic import BaseModel, Field
import pandas as pd
import logging
import io  # Add this import
import base64  # Add this import
import matplotlib
matplotlib.use('Agg')  # Set this before importing pyplot
import matplotlib.pyplot as plt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class State(TypedDict):
    messages: Annotated[Sequence[AnyMessage], add_messages]

class VisualizationCode(BaseModel):
    code: str = Field(..., description="Should only and only consists of valid Python code snippet that can be executed to create a visualization")

class VisualizationAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)
        self.python_repl = PythonREPL()
    
    def create_python_code(self, state: State):
        """Create visualization based on the query result"""
        messages = state["messages"]
        print("---------------------------Creating python code---------------------------")
        print(f"Messages inside the create_python_code function: {messages}")
        print("---------------------------------------------------------------------------")
        
        create_python_code_system = """You are a data visualization expert. Using the provided query result, 
        create a visually appealing visualization using matplotlib.
        The data will be provided as a string that you need to convert to a pandas DataFrame.

        Important guidelines:
        1. Do not use plt.show()
        2. Use plt.figure() with figsize=(12, 7)
        3. Use a modern style: plt.style.use('seaborn')
        4. Apply these aesthetic improvements:
        - Use appealing color palettes (e.g., 'Set3', 'Pastel1', or 'husl')
        - Add grid with alpha=0.3 for better readability
        - Use clean, readable fonts (e.g., 'Helvetica' or 'Arial')
        - Add subtle background colors
        - Use proper spacing and padding
        - Include clear titles and labels with appropriate font sizes
        5. Enhance readability:
        - Rotate x-labels if needed using plt.xticks(rotation=45)
        - Add value labels on bars for bar charts
        - Use proper legend positioning
        - Format numbers with appropriate decimal places
        6. Additional styling:
        - Add a light grid: plt.grid(True, alpha=0.3)
        - Use plt.tight_layout() for proper spacing
        - Set facecolor='#f8f9fa' for a light background
        - Add subtle spines: [ax.spines[spine].set_alpha(0.3) for spine in ['top', 'right']]

        Return only the Python code needed to create the visualization."""

        create_python_code_prompt = ChatPromptTemplate.from_messages([
            ("system", create_python_code_system),
            (MessagesPlaceholder(variable_name="messages"))
        ])
        
        create_python_code_llm = self.llm.with_structured_output(VisualizationCode)
        create_python_code_result = create_python_code_llm.invoke(messages)
        print(create_python_code_result)
        print("--------------------------------Python code created--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{create_python_code_result.code}")]}
    
    def create_visualization(self, state: State):
        messages = state["messages"]
        python_code = messages[-1].content

        try:
            # Set global font to a modern, clean option
            plt.rcParams['font.family'] = 'sans-serif'
            plt.rcParams['font.sans-serif'] = ['Arial']
            
            # Execute the visualization code
            output = self.python_repl.run(python_code)
            
            # Save with high quality settings
            buf = io.BytesIO()
            plt.savefig(buf, 
                    format='png',
                    bbox_inches='tight',
                    dpi=300,
                    facecolor='#f8f9fa',
                    edgecolor='none',
                    pad_inches=0.2)
            buf.seek(0)
            
            img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
            img_data_url = f"data:image/png;base64,{img_str}"
            
            plt.close('all')
            
            return {"messages": state["messages"] + [AIMessage(content=img_data_url)]}
                
        except Exception as e:
            logger.error(f"Error creating visualization: {str(e)}")
            return {"messages": state["messages"] + [AIMessage(content=f"Error creating visualization: {str(e)}")]}

    def graph_workflow(self, query_result: str):
        workflow = StateGraph(State)
        
        workflow.add_node("create_python_code", self.create_python_code)
        workflow.add_node("create_visualization", self.create_visualization)    
        
        workflow.add_edge(START, "create_python_code")
        workflow.add_edge("create_python_code", "create_visualization")
        workflow.add_edge("create_visualization", END)
        
        app = workflow.compile()
        

        response = app.invoke({"messages": [HumanMessage(content=query_result)]})
        return response["messages"][-1].content
    

if __name__ == "__main__":
    viz_agent = VisualizationAgent()
    query_result = "Create a histogram for this -Here is the data for Led Zeppelin's and Queen's total sales and number of tracks sold each year:\n\n- **2009**\n  - Led Zeppelin: $22.77, 23 tracks\n  - Queen: $4.95, 5 tracks\n\n- **2010**\n  - Led Zeppelin: $21.78, 22 tracks\n  - Queen: $0.99, 1 track\n\n- **2011**\n  - Led Zeppelin: $2.97, 3 tracks\n  - Queen: $10.89, 11 tracks\n\n- **2012**\n  - Led Zeppelin: $23.76, 24 tracks\n  - Queen: $10.89, 11 tracks\n\n- **2013**\n  - Led Zeppelin: $14.85, 15 tracks\n  - Queen: $8.91, 9 tracks"
    response = viz_agent.graph_workflow(query_result)
    print("--------------------------------Graph workflow completed--------------------------------")
    print(response)