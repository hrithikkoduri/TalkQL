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
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.python_repl = PythonREPL()
    
    def create_python_code(self, state: State):
        """Create visualization based on the query result"""
        messages = state["messages"]
        print("---------------------------Creating python code---------------------------")
        print(f"Messages inside the create_python_code function: {messages}")
        print("---------------------------------------------------------------------------")
        
        create_python_code_system = """
        You are a data visualization expert. Create intuitive and consistent visualizations that match our modern UI aesthetic.

        Important guidelines:
        1. Data Analysis and Representation:
        - Parse and validate all numerical values from input data
        - Ensure exact representation of all data points
        - Convert string values to appropriate numeric types
        - Sort data by total values for better visualization
        - Handle missing or null values gracefully

        2. Visual Elements:
        - For stacked/grouped bars:
            * Use distinct colors with good contrast
            * Maintain consistent bar width
            * Add value labels above each bar segment
            * Use alpha=0.8 for better readability
        - For combination charts:
            * Align bars with primary y-axis
            * Place lines on secondary y-axis if scales differ
            * Use markers for data points on lines

        3. Data Labels and Text:
        - Add clear value labels on all data points
        - Format numbers appropriately (e.g., '%.2f' for decimals)
        - Position labels with sufficient padding (padding=3)
        - Rotate x-axis labels if needed (rotation=45)
        - Ensure no text overlap by adjusting positions

        4. Layout and Spacing:
        - Figure size: plt.figure(figsize=(12, 7))
        - Add padding between elements: plt.tight_layout(pad=1.5)
        - Set margins to prevent cutoff: plt.margins(y=0.2)
        - Position legend outside plot area if needed
        - Use gridlines with alpha=0.2 for readability

        5. Color Scheme:
        Primary palette for multiple attributes:
        - First: '#6366F1' (Indigo-500)
        - Second: '#818CF8' (Indigo-400)
        - Third: '#A5B4FC' (Indigo-300)
        - Accent: '#E11D48' (Rose-600)
        - Use alpha=0.8 for bars
        - Use darker shades for important elements

        Example code for multi-attribute visualizations:

        1. Stacked Bar Chart with Line:

        python
        
        #Data preparation
        df = df.sort_values('Total Sales', ascending=True) # Sort for better visualization
        
        #Create figure and axes
        fig, ax1 = plt.subplots(figsize=(12, 7))
        
        #Plot stacked bars
        bars1 = ax1.barh(df['Artist'], df['Tracks Sold'],
        color='#6366F1', alpha=0.8, label='Tracks Sold')
        bars2 = ax1.barh(df['Artist'], df['Tracks Unsold'],
        left=df['Tracks Sold'], color='#818CF8',
        alpha=0.8, label='Tracks Unsold')
        
        #Add value labels on bars
        ax1.bar_label(bars1, label_type='center', fmt='%d')
        ax1.bar_label(bars2, label_type='center', fmt='%d')
        
        #Create secondary axis for line plot
        ax2 = ax1.twiny()
        line = ax2.plot(df['Total Sales'], df['Artist'],
        color='#E11D48', marker='o',
        linewidth=2, label='Total Sales ($)')
        ax2.scatter(df['Total Sales'], df['Artist'],
        color='#E11D48', s=50)
        
        #Customize axes
        ax1.set_xlabel('Number of Tracks')
        ax2.set_xlabel('Total Sales ($)')
        ax1.grid(True, alpha=0.2)
        #Add legend
        lines = [bars1, bars2, line[0]]
        labels = ['Tracks Sold', 'Tracks Unsold', 'Total Sales ($)']
        ax1.legend(lines, labels, bbox_to_anchor=(1.15, 1))
        plt.tight_layout(pad=1.5)

        2. Grouped Bar Chart:

        python
        #Setup
        fig, ax = plt.subplots(figsize=(12, 7))
        x = np.arange(len(df['Category']))
        width = 0.25
        
        #Create grouped bars
        bars1 = ax.bar(x - width, df['Value1'], width,
        label='Metric 1', color='#6366F1', alpha=0.8)
        bars2 = ax.bar(x, df['Value2'], width,
        label='Metric 2', color='#818CF8', alpha=0.8)
        bars3 = ax.bar(x + width, df['Value3'], width,
        label='Metric 3', color='#A5B4FC', alpha=0.8)
        
        #Add value labels
        ax.bar_label(bars1, padding=3, fmt='%.1f')
        ax.bar_label(bars2, padding=3, fmt='%.1f')
        ax.bar_label(bars3, padding=3, fmt='%.1f')
        
        #Customize axes
        ax.set_xticks(x)
        ax.set_xticklabels(df['Category'], rotation=45, ha='right')
        ax.grid(True, alpha=0.2)
        
        #Add legend
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout(pad=1.5)

        3. Line Chart with Multiple Metrics:

        #python
        #Setup
        fig, ax = plt.subplots(figsize=(12, 7))
        #Plot multiple lines
        for i, metric in enumerate(['Metric1', 'Metric2', 'Metric3']):
            color = ['#6366F1', '#818CF8', '#E11D48'][i]
            line = ax.plot(df['Date'], df[metric],
            label=metric, color=color,
            linewidth=2, marker='o')
        # Add value labels
        for x, y in zip(df['Date'], df[metric]):
            ax.annotate(f'{{y:.1f}}', (x, y),
            textcoords="offset points",
            xytext=(0,10), ha='center')
        
        #Customize axes
        ax.grid(True, alpha=0.2)
        ax.set_xticklabels(df['Date'], rotation=45, ha='right')
        
        #Add legend
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        plt.tight_layout(pad=1.5)

        4. Example code structure for multi-attribute bar chart: 
        
        #python
        
        #Setup
        plt.figure(figsize=(12, 7))
        plt.style.use('seaborn-v0_8-whitegrid')
        
        #Create bars
        bars1 = plt.bar(x, y1, label='Attribute 1', color='#6366F1', alpha=0.8)
        bars2 = plt.bar(x, y2, bottom=y1, label='Attribute 2', color='#818CF8', alpha=0.8)
        
        #Add value labels
        plt.bar_label(bars1, padding=3, fmt='%.2f')
        plt.bar_label(bars2, padding=3, fmt='%.2f')
        
        #Customize axes
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.2)
        
        #Add legend
        plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        #Adjust layout
        plt.tight_layout(pad=1.5)
        plt.margins(y=0.2)

        """
        
        create_python_code_prompt = ChatPromptTemplate.from_messages([
            ("system", create_python_code_system),
            (MessagesPlaceholder(variable_name="messages"))
        ])
        formatted_create_python_code_prompt = create_python_code_prompt.invoke({"messages": messages})
        create_python_code_llm = self.llm.with_structured_output(VisualizationCode)
        create_python_code_result = create_python_code_llm.invoke(formatted_create_python_code_prompt)
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