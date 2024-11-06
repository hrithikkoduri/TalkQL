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
        
        create_python_code_system = """You are a data visualization expert. Create intuitive and consistent visualizations that match our modern UI aesthetic.

        Important guidelines:
        1. Base Style and Colors:
        - Use plt.style.use('seaborn-v0_8-whitegrid')
        - Primary color: '#6366F1' (Indigo-500)
        - Secondary colors: ['#818CF8', '#A5B4FC'] (Indigo-400, 300)
        - Accent color: '#E11D48' (Rose-600) for highlights/lines
        - Background: '#ffffff'
        - Text: '#1F2937' (Gray-800)

        2. Layout and Sizing:
        - Figure: plt.figure(figsize=(10, 6))
        - Margins: plt.margins(x=0.02, y=0.1)
        - DPI: plt.gcf().set_dpi(120)
        - Padding: plt.tight_layout(rect=[0.02, 0.03, 0.98, 0.95])

        3. Typography Hierarchy:
        - Title: 14pt, weight='semibold', color='#1F2937'
        - Axis labels: 11pt, weight='medium', color='#4B5563'
        - Tick labels: 10pt, color='#6B7280'
        - Legend: 10pt, frameon=False, loc='upper right'

        4. Bar Charts:
        - Bar alpha: 0.9
        - Edge color: '#ffffff'
        - Bar width: 0.7
        - Add subtle gradient using ax.patches
        - Horizontal preferred for better label readability

        5. Line Charts:
        - Line width: 2.5
        - Marker size: 6
        - Add subtle gradient fill below lines
        - Use rounded line joins

        6. Polish:
        - Remove top and right spines
        - Grid: color='#E2E8F0', alpha=0.2, linestyle='--'
        - Add subtle padding around elements
        - Use thousands separator for large numbers
        - Sort data in meaningful order (usually descending)
        - Add value labels on bars for better readability

        Remember:
        - Keep visualizations simple and focused
        - Use consistent spacing and alignment
        - Ensure text never overlaps with data
        - Add subtle animations or gradients where appropriate
        - Format numbers for better readability (e.g., '1.5M' instead of '1500000')"""
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
            # Set global style
            # Set global style
            plt.style.use('seaborn-v0_8-whitegrid')
            plt.rcParams.update({
                # Font settings
                'font.family': 'sans-serif',
                'font.sans-serif': ['Arial', 'Helvetica'],
                'font.weight': 'medium',
                
                # Figure settings
                'figure.figsize': (10, 6),
                'figure.dpi': 120,
                'figure.facecolor': '#ffffff',
                
                # Axes settings
                'axes.facecolor': '#ffffff',
                'axes.edgecolor': '#E2E8F0',
                'axes.linewidth': 0.8,
                'axes.grid': True,
                'axes.titlesize': 14,
                'axes.titleweight': 'semibold',
                'axes.titlepad': 20,
                'axes.labelsize': 11,
                'axes.labelweight': 'medium',
                'axes.labelcolor': '#4B5563',
                'axes.spines.top': False,
                'axes.spines.right': False,
                
                # Grid settings
                'grid.color': '#E2E8F0',
                'grid.alpha': 0.2,
                'grid.linestyle': '--',
                
                # Tick settings
                'xtick.color': '#6B7280',
                'ytick.color': '#6B7280',
                'xtick.labelsize': 10,
                'ytick.labelsize': 10,
                
                # Legend settings
                'legend.frameon': False,
                'legend.fontsize': 10,
                'legend.title_fontsize': 11,
                
                # Layout
                'figure.constrained_layout.use': True,
                'figure.constrained_layout.h_pad': 0.4,
                'figure.constrained_layout.w_pad': 0.4
            })
            
            # Execute visualization code
            output = self.python_repl.run(python_code)
            
            # Save with enhanced quality settings
            buf = io.BytesIO()
            plt.savefig(buf, 
                    format='png',
                    bbox_inches='tight',
                    dpi=300,
                    facecolor='#ffffff',
                    edgecolor='none',
                    pad_inches=0.3,
                    transparent=False)
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