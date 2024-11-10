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
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class State(TypedDict):
    messages: Annotated[Sequence[AnyMessage], add_messages]

class VisualizationCode(BaseModel):
    code: str = Field(..., description="Should only and only consists of valid Python code snippet that can be executed to create a visualization")

class VisualizationAdvice(BaseModel):
    advice: str = Field(..., description="Should only and only consists of valid advice on how to create the best, intuitive and comprehensive visualization")

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

            You are a data visualization expert. Create intuitive and comprehensive visualizations from SQL query results that make the data immediately understandable without referencing the original query. Place significant emphasis on data labeling to enhance clarity.
            You are also given some advice on how to create the best, intuitive and comprehensive visualization.

            **Core Principles:**

            1. **Data Analysis & Preprocessing:**
            - Understand the structure of SQL results.
            - Distinguish between metrics (quantitative) and dimensions (categorical/temporal).
            - Identify data hierarchies and relationships.
            - Handle null values and format data appropriately.
            - Apply meaningful sorting (e.g., by key metrics, chronological order).
            - Calculate derived metrics when useful (e.g., percentages, growth rates).

            2. **Visualization Selection:**
            - **Categorical Data:**
                - Use horizontal bar charts for 7 or more categories.
                - Use vertical bar charts for fewer categories.
                - Include totals and averages as reference lines.
                - Avoid pie/donut charts unless displaying compositions with 6 or fewer categories.
            - **Time Series:**
                - Use line charts for continuous trends.
                - Use bar charts for discrete time periods.
                - Mark year-over-year or month-over-month changes.
                - Highlight minimum and maximum points.
            - **Comparisons:**
                - Use grouped or stacked bar charts for comparisons.
                - Use scatter plots for correlations.
                - Use combo charts for mixed metric types.
            - **Multi-Axis Design:**
                - When data ranges differ significantly, use separate axes to improve clarity and readability.
                - Implement dual-axis charts to display metrics with different scales effectively.

            3. **Comprehensive Labeling:**
            - **Data Point Labels:**
                - Display actual values on or near data points.
                - Include percentages of total where relevant.
                - Add growth indicators (e.g., ±%).
                - Position labels to avoid overlap between data labels and different data representations. Use offsets or callouts if necessary.
            - **Axis Labels:**
                - Use clear, descriptive labels with units.
                - Format scales appropriately (e.g., K for thousands, M for millions).
                - Apply proper date formats.
                - Avoid truncated labels.
            - **Annotations:**
                - Indicate totals, averages, and significant changes.
                - Highlight outliers or notable trends.
                - Include brief explanatory notes when necessary.

            4. **Layout & Design:**
            - Set appropriate figure dimensions and margins (e.g., `plt.figure(figsize=(12, 7))`). Adjust the figure size if needed to prevent overlapping elements.
            - Apply a clear title hierarchy:
                - **Main Title:** Convey key insights.
                - **Subtitle:** Provide context and time period.
                - **Caption:** Include data sources or notes.
            - Position legends optimally based on chart space, ensuring they do not overlap with chart elements.
            - Use light gridlines for reference (`alpha=0.2`).
            - Apply consistent font sizes:
                - **Title:** 14pt bold.
                - **Labels:** 10pt.
                - **Annotations:** 9pt.

            5. **Color Standards:**
            - Primary colors for consistency:
                - Single series: '#6366F1' (Indigo-500)
                - Two series: ['#6366F1', '#818CF8'] (Indigo-500, Indigo-400)
                - Multiple series: Use color gradients from blue to purple
                - Highlight colors: '#E11D48' (Rose-600) for emphasis
                - Positive trends: '#22C55E' (Green-600)
                - Negative trends: '#EF4444' (Red-500)
            - Apply alpha=0.8 for main elements
            - Use darker shades for important data points
            - For categorical data, use evenly spaced colors from the blue-purple gradient
            - Add subtle gradients for fill areas using alpha blending

            **Key Considerations:**

            - Tailor the visualization to data complexity and audience needs.
            - Ensure clarity and readability at intended display sizes.
            - Use multi-axis or dual-axis designs to effectively communicate data with different value ranges.
            - Include all necessary context within the visualization.

            **The final visualization should:**

            - Tell a complete data story at a glance.
            - Highlight key insights and patterns.
            - Clearly display all relevant metrics, using distinct axes if necessary.
            - Maintain proper proportions and scales.
            - Be uncluttered, well-organized, and immediately understandable.
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
    
    def viz_advice(self, state: State):
        """Give advice on how to improve the visualization"""
        messages = state["messages"]
        print("---------------------------Giving advice on how to improve the visualization---------------------------")
        print(f"Messages inside the viz_advice function: {messages}")
        print("---------------------------------------------------------------------------")

        viz_advice_system = """
        **You are a data visualization expert.**

**You have been given data generated from querying a database. Your task is to provide advice on how to best visualize this data. Structure your advice as a prompt for an LLM to generate the visualization code. Your goal is to create the best, most intuitive, and comprehensive visualization.**

**Make sure your instructions take into account all details mentioned in the provided data and emphasize the following:**

- **Data labeling** to enhance clarity.
- **Proper axis labeling.**
- **Accurate data representation.**
- **Appropriate color scheme.**
- **Clear legend descriptions.**
- **Proper spacing and figure size.**
- **Effective overall layout.**

**Ensure that:**

- There is **no overlap** among graph elements, data labels, and legends.
- Data labels **do not overlap** with each other.
- **Data from different categories or rows are not incorrectly aggregated or mixed together. Each category's data should be represented separately and accurately.**

---

### **Instructions for the Visualization:**

1. **Data Labeling:**

   - **Accuracy:**
     - Ensure all data labels correctly correspond to their respective data points.
     - Use appropriate metrics and units (e.g., percentages, currency, units of measurement).
   - **Consistency:**
     - Maintain consistent formatting and precision across all labels (e.g., number of decimal places).

2. **X-Axis Tick Labels:**

   - **Rotation for Readability:**
     - Rotate the x-axis tick labels by **45 degrees** to improve readability.
     - If labels still overlap after a 45-degree rotation:
       - Rotate the tick labels by **90 degrees** (vertical orientation).
       - **Adjust Font Size:** Reduce the font size to fit labels without overlap.
       - **Abbreviation:** Abbreviate or truncate labels while keeping them understandable.
     - **Spacing:** Ensure adequate spacing between labels to prevent overlapping.

3. **Prevent Data Label Overlapping:**

   - **Detection of Overlaps:**
     - Identify potential overlaps by checking for data points with similar values or close proximity on the chart.
   - **Spacing and Positioning:**
     - **Reposition Overlapping Labels:** Place them in areas with more space, away from crowded regions.
     - **Offsets and Staggering:** Use offsets or stagger label positions (e.g., alternate above and below data points) to enhance visibility.
   - **Color Differentiation:**
     - Use colors from the legend to differentiate labels, matching label colors with their corresponding data series or categories.

4. **Data Representation:**

   - **Accuracy:**
     - Accurately plot all data points from the query result.
     - Ensure data points align correctly with the x and y axes.
     - **Prevent Incorrect Aggregation:**
       - Do **not** sum or combine data from different categories unless explicitly required.
       - Ensure that data from different categories (e.g., artists and their sales partnerships) are represented separately and accurately.
   - **Completeness:**
     - Include all relevant data series and categories in the visualization.
   - **Integrity:**
     - Do not distort or manipulate data representation in ways that could mislead interpretation.

5. **Axis Labels:**

   - **Clarity:**
     - Use clear, descriptive labels for both x and y axes.
     - Include units of measurement where applicable (e.g., "Artist Name", "Revenue (USD)").
   - **Formatting:**
     - Use a readable font size and style consistent with the rest of the visualization.
   - **Positioning:**
     - Ensure axis labels do not overlap with graph elements like data points, lines, or bars.
     - Adjust label placement if necessary (e.g., add padding or adjust margins).

6. **Totals and Averages:**

   - **Display:**
     - Show totals or averages only when meaningful and appropriate.
     - **Aggregate Correctly:**
       - Aggregate data within the same category if required (e.g., total revenue per artist).
       - Do not aggregate across different categories unintentionally.
   - **Positioning:**
     - Place these values where they do not interfere with other data.
   - **Labeling:**
     - Clearly indicate what each total or average represents (e.g., "Total Revenue per Artist").
   - **Formatting:**
     - Differentiate these values using distinct styles (e.g., dashed lines, different colors).

7. **Clarity and Spacing:**

   - **Uncluttered Design:**
     - Avoid overcrowding the visualization with too many elements.
     - Remove unnecessary gridlines or background elements that do not add value.
   - **Whitespace:**
     - Utilize whitespace effectively to separate different sections and elements.
   - **Element Sizing:**
     - Ensure all elements (text, markers, lines) are appropriately sized for readability.
   - **Alignment:**
     - Align elements neatly to create a professional and organized appearance.

8. **Handling Varying Data Ranges:**

   - **Separate Axes:**
     - Use separate y-axes for data series with significantly different ranges.
     - Implement dual-axis charts with one y-axis on the left and another on the right if necessary.
   - **Differentiation:**
     - Use different line styles or markers to distinguish between data series associated with different axes.
   - **Axis Labels:**
     - Clearly label each axis with the units and data series it represents.
     - Match the color of axis labels and tick marks with the corresponding data series if appropriate.
   - **Scaling:**
     - Ensure the scales of both axes are appropriate for the data they represent to prevent misinterpretation.

---

Use these guidelines to advise on creating the most effective, intuitive, and comprehensive visualization possible based on the provided data, ensuring that data from different categories or rows are represented separately and not incorrectly aggregated or mixed together.
        """

        viz_advice_prompt = ChatPromptTemplate.from_messages([
            ("system", viz_advice_system),
            ("user", f"Here is the text information used to generate the code: {messages[0].content}")
        ])
        formatted_viz_advice_prompt = viz_advice_prompt.invoke({})
        viz_advice_llm = self.llm.with_structured_output(VisualizationAdvice)
        viz_advice_result = viz_advice_llm.invoke(formatted_viz_advice_prompt)
        print(viz_advice_result)
        print("--------------------------------Advice given--------------------------------")
        return {"messages": state["messages"] + [AIMessage(content = f"{viz_advice_result.advice}")]}
    

    def create_visualization(self, state: State):
        messages = state["messages"]
        python_code = messages[-1].content

        try:
            plt.style.use('seaborn-v0_8-whitegrid')
            plt.rcParams.update({
                # Increase figure size
                'figure.figsize': (20, 12),
                'figure.dpi': 300,
                
                # Keep font sizes smaller for better aesthetics
                'axes.titlesize': 14,
                'axes.labelsize': 12,
                'xtick.labelsize': 10,
                'ytick.labelsize': 10,
                'legend.fontsize': 10,
                
                # Other settings remain the same
                'font.family': 'sans-serif',
                'font.sans-serif': ['Arial', 'Helvetica'],
                'font.weight': 'medium',
                'figure.facecolor': '#ffffff',
                'axes.facecolor': '#ffffff',
                'axes.edgecolor': '#E2E8F0',
                'axes.linewidth': 0.8,
                'axes.grid': True,
                'axes.titleweight': 'semibold',
                'axes.titlepad': 20,
                'axes.labelweight': 'medium',
                'axes.labelcolor': '#4B5563',
                'axes.spines.top': False,
                'axes.spines.right': False,
                'grid.color': '#E2E8F0',
                'grid.alpha': 0.2,
                'grid.linestyle': '--',
                'legend.frameon': False,
                'figure.constrained_layout.use': True,
                'figure.constrained_layout.h_pad': 1.0,
                'figure.constrained_layout.w_pad': 1.0
            })
                
            # Execute visualization code
            output = self.python_repl.run(python_code)
            
            # Apply rotation to x-axis labels after plot is created
            plt.xticks(rotation=45, ha='right')
            
            # Save with enhanced quality settings
            buf = io.BytesIO()
            plt.savefig(buf, 
                    format='png',
                    bbox_inches='tight',
                    dpi=300,
                    facecolor='#ffffff',
                    edgecolor='none',
                    pad_inches=0.5,
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
        workflow.add_node("viz_advice", self.viz_advice)

        workflow.add_edge(START, "viz_advice")
        workflow.add_edge("viz_advice", "create_python_code")
        workflow.add_edge("create_python_code", "create_visualization")
        #workflow.add_edge("correct_python_code", "create_visualization")
        workflow.add_edge("create_visualization", END)
        
        app = workflow.compile()
        

        response = app.invoke({"messages": [HumanMessage(content=query_result)]})
        return response["messages"][-1].content
    
    def apply_style_enhancements(self):
        """Apply consistent style enhancements to the current plot"""
        # Get current axis
        ax = plt.gca()
        
        # Add subtle gradient background
        ax.set_facecolor('#F8FAFC')
        
        # Enhance legend
        if ax.get_legend():
            ax.legend(
                facecolor='white',
                edgecolor='#E2E8F0',
                framealpha=0.9,
                loc='best',
                bbox_to_anchor=(1.02, 1),
            )
        
        # Add subtle top border gradient
        gradient = np.linspace(0, 1, 100).reshape(1, -1)
        gradient = np.vstack((gradient, gradient))
        extent = [ax.get_xlim()[0], ax.get_xlim()[1], 1.01, 1.02]
        ax.imshow(gradient, aspect='auto', extent=extent, 
                  cmap='RdYlBu_r', alpha=0.1)
        
        # Enhance grid
        ax.grid(True, 'major', color='#E2E8F0', alpha=0.2, linestyle='--')
        
        # Add padding
        plt.tight_layout(pad=1.5)

    def get_color_palette(self, n_colors):
        """Generate a consistent color palette for n series"""
        if n_colors == 1:
            return ['#6366F1']
        elif n_colors == 2:
            return ['#6366F1', '#818CF8']
        else:
            return [plt.cm.RdYlBu(i/n_colors) for i in range(n_colors)]

if __name__ == "__main__":
    viz_agent = VisualizationAgent()
    query_result = "Create a histogram for this -Here is the data for Led Zeppelin's and Queen's total sales and number of tracks sold each year:\n\n- **2009**\n  - Led Zeppelin: $22.77, 23 tracks\n  - Queen: $4.95, 5 tracks\n\n- **2010**\n  - Led Zeppelin: $21.78, 22 tracks\n  - Queen: $0.99, 1 track\n\n- **2011**\n  - Led Zeppelin: $2.97, 3 tracks\n  - Queen: $10.89, 11 tracks\n\n- **2012**\n  - Led Zeppelin: $23.76, 24 tracks\n  - Queen: $10.89, 11 tracks\n\n- **2013**\n  - Led Zeppelin: $14.85, 15 tracks\n  - Queen: $8.91, 9 tracks"
    response = viz_agent.graph_workflow(query_result)
    print("--------------------------------Graph workflow completed--------------------------------")
    print(response)