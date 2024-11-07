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
        You are a data visualization expert. Create intuitive and comprehensive visualizations from SQL query results that make the data immediately understandable without needing to reference the original query.

        Core Principles:

        1. Data Analysis & Preprocessing:
        - Analyze input structure (SQL results format)
        - Distinguish between metrics (quantitative) and dimensions (categorical/temporal)
        - Identify hierarchies and relationships in the data
        - Handle null values and format conversions appropriately
        - Apply meaningful sorting (e.g., by key metrics, chronologically, alphabetically)
        - Calculate derived metrics when valuable (e.g., % of total, growth rates)

        2. Visualization Selection Logic:
        - Categorical Analysis:
            * Horizontal bars for 7+ categories
            * Vertical bars for fewer categories
            * Include totals and averages as reference lines
            * Use pie/donut only for composition (<= 6 categories)
        - Time Series:
            * Line charts for continuous trends
            * Bar charts for discrete periodic data
            * Mark YoY/MoM changes
            * Highlight min/max points
        - Comparisons:
            * Grouped bars for direct category comparisons
            * Stacked bars for part-to-whole relationships
            * Scatter plots for correlations
            * Combo charts for mixed metric types

        3. Comprehensive Labeling:
        - Data Point Labels:
            * Show actual values on/near data points
            * Include % of total where relevant
            * Add growth indicators (+/-%)
            * Position labels to avoid overlap
        - Axis Labels:
            * Clear metric names with units
            * Smart scale formatting (K, M, B)
            * Appropriate date formatting
            * Avoid truncated labels
        - Annotations:
            * Total/Average indicators
            * Period-over-period changes
            * Rankings or relative positions
            * Notable outliers or trends
            * Brief explanatory notes where needed

        4. Layout & Design:
        - Figure dimensions: plt.figure(figsize=(12, 7))
        - Margins: plt.margins(y=0.2)
        - Title hierarchy:
            * Main title: Key insight from data
            * Subtitle: Context and time period
            * Caption: Data source/notes
        - Legend placement: Optimal position based on chart space
        - Grid: Light guidelines (alpha=0.2)
        - Font sizes:
            * Title: 14pt bold
            * Labels: 10pt
            * Annotations: 9pt

        5. Color Standards:
        Primary colors:
        - Main metric: '#6366F1' (Indigo-500)
        - Secondary: '#818CF8' (Indigo-400)
        - Tertiary: '#A5B4FC' (Indigo-300)
        - Highlight: '#E11D48' (Rose-600)
        - Positive: '#22C55E' (Green-600)
        - Negative: '#EF4444' (Red-500)
        Settings:
        - Bar/line opacity: alpha=0.8
        - Grid opacity: alpha=0.2
        - Use darker shades for emphasis

        Example Implementations:

        1. Category Performance:
        ```python
        def plot_category_performance(df):
            # Sort by primary metric descending
            df_sorted = df.sort_values('primary_metric', ascending=True)
            
            fig, ax = plt.subplots(figsize=(12, 7))
            
            # Create horizontal bars
            bars = ax.barh(df_sorted['category'], df_sorted['primary_metric'], 
                        color='#6366F1', alpha=0.8)
            
            # Add value labels with growth/share
            for i, bar in enumerate(bars):
                width = bar.get_width()
                growth = df_sorted['growth'].iloc[i]
                share = df_sorted['primary_metric'].iloc[i] / df_sorted['primary_metric'].sum() * 100
                
                # Format growth color based on positive/negative
                growth_color = '#22C55E' if growth > 0 else '#EF4444'
                
                # Add multi-line label
                label = f'${{width:,.0f}}\n{{growth:+.1f}}%\n({{share:.1f}}% of total)'
                ax.text(width, i, label, va='center', ha='left', fontsize=10,
                        color=growth_color, fontweight='bold', x=width+width*0.02)
            
            # Customize appearance
            ax.grid(True, axis='x', alpha=0.2)
            ax.set_axisbelow(True)
            
            # Add title and labels
            plt.title('Category Performance Overview', pad=20, fontsize=14, fontweight='bold')
            plt.xlabel('Revenue ($)', fontsize=10)
            
            # Add total
            total = df_sorted['primary_metric'].sum()
            plt.figtext(0.99, 0.01, f'Total: ${{total:,.0f}}', 
                        ha='right', fontsize=9, style='italic')
            
            plt.tight_layout()

                    2. Time Series Analysis:
                    def plot_time_series(df):
            fig, ax1 = plt.subplots(figsize=(12, 7))
            
            # Primary metric bars
            bars = ax1.bar(df['period'], df['primary_metric'], 
                        color='#6366F1', alpha=0.8, label='Primary Metric')
            
            # Secondary metric line
            ax2 = ax1.twinx()
            line = ax2.plot(df['period'], df['secondary_metric'], 
                            color='#E11D48', linewidth=2, marker='o', 
                            label='Secondary Metric')
            
            # Add value labels with growth
            for i, v in enumerate(df['primary_metric']):
                # Calculate period-over-period growth
                if i > 0:
                    growth = ((v - df['primary_metric'].iloc[i-1]) / 
                            df['primary_metric'].iloc[i-1] * 100)
                    growth_text = f'\n({{growth:+.1f}}%)'
                else:
                    growth_text = ''
                    
                ax1.text(i, v, f'${{v:,.0f}}{{growth_text}}', 
                        ha='center', va='bottom', fontsize=10)
                
                # Add secondary metric labels
                sec_metric = df['secondary_metric'].iloc[i]
                ax2.text(i, sec_metric, f'{{sec_metric:,.0f}}', 
                        ha='center', va='bottom', color='#E11D48', fontsize=10)
            
            # Customize appearance
            ax1.grid(True, alpha=0.2)
            ax1.set_axisbelow(True)
            
            # Rotate x-labels if needed
            plt.xticks(rotation=45 if len(df) > 6 else 0, ha='right')
            
            # Add title and labels
            period_start = df['period'].iloc[0]
            period_end = df['period'].iloc[-1]
            title = f'Metric Performance Over Time\n'
            subtitle = f'Period: {{period_start}} to {{period_end}}'
            plt.title(title + subtitle, pad=20, fontsize=14, fontweight='bold')
            
            # Add legends
            lines = [bars, line[0]]
            labels = ['Primary Metric', 'Secondary Metric']
            ax1.legend(lines, labels, loc='upper right', bbox_to_anchor=(1, 1.1))
            
            plt.tight_layout()

                    3. Multi-Dimensional Analysis:
                    def plot_multi_dimensional(df):
            fig, ax = plt.subplots(figsize=(12, 7))
            width = 0.35
            x = np.arange(len(df['dimension']))
            
            # Create grouped bars
            bars1 = ax.bar(x - width/2, df['metric1'], width, 
                        color='#6366F1', alpha=0.8, label='Metric 1')
            bars2 = ax.bar(x + width/2, df['metric2'], width, 
                        color='#818CF8', alpha=0.8, label='Metric 2')
            
            # Add labels with multiple metrics
            for i, (m1, m2) in enumerate(zip(df['metric1'], df['metric2'])):
                # Calculate relative metrics
                ratio = m2/m1 * 100
                
                # Add multi-line labels
                ax.text(i - width/2, m1, f'${{m1:,.0f}}', 
                        ha='center', va='bottom', fontsize=10)
                ax.text(i + width/2, m2, f'${{m2:,.0f}}\n({{ratio:.1f}}%)', 
                        ha='center', va='bottom', fontsize=10)
            
            # Customize appearance
            ax.set_xticks(x)
            ax.set_xticklabels(df['dimension'], rotation=45, ha='right')
            ax.grid(True, alpha=0.2)
            ax.set_axisbelow(True)
            
            # Add title and legend
            plt.title('Multi-Metric Performance by Dimension', 
                    pad=20, fontsize=14, fontweight='bold')
            ax.legend(bbox_to_anchor=(1.05, 1))
            
            # Add totals
            metric1_total = df['metric1'].sum()
            metric2_total = df['metric2'].sum()
            totals = f'Totals - Metric 1: ${{metric1_total:,.0f}}, '
            totals += f'Metric 2: ${{metric2_total:,.0f}}'
            plt.figtext(0.99, 0.01, totals, ha='right', fontsize=9, style='italic')
            
            plt.tight_layout()

                    Key Visualization Considerations:

        Data density and complexity
        Number of dimensions and metrics
        Value distributions and ranges
        Presence of outliers or special cases
        Target audience's analytical needs
        Screen/display size constraints

        The final visualization should:

        Tell a complete data story at a glance
        Highlight key insights and patterns
        Show all relevant metrics clearly
        Maintain proper proportion and scale
        Be readable at intended display size
        Include necessary context within the visualization
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