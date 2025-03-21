from crewai import Agent, Task, Crew, Process
import json
import io
import pdfplumber
from datetime import date
from database import ingredients_collection
from chef import get_llm


def process_invoice_pdf(file_data):
    try:
        file_stream = io.BytesIO(file_data)
        with pdfplumber.open(file_stream) as pdf:
            extracted_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        if not extracted_text.strip():
            return {"error": "No text extracted from the invoice."}

        llm = get_llm()

        extractor = Agent(
            role="Food Invoice Data Extractor",
            goal="""Extract only food-related items (product titles/names/descriptions) and quantities from invoices with 100% accuracy, ensuring consistency and removing brand-specific information.

Instructions:

Extract only food-related items while filtering out non-food products.
Generalize item names by removing brand names and ensuring uniformity.
If the same product appears with different descriptions (e.g., Kashmir Apple vs. Apple), standardize it to the most general form (Apple).
Avoid duplicate entries due to slight naming variations (e.g., Chips Lay's India's Magic Masala and Lay's India's Magic Masala Potato Chips should both be recognized as Magic Masala Chips).
Ensure structured and accurate extraction with no irrelevant data.""",
            backstory="An AI expert in parsing invoices with a specialized focus on food-related items. It intelligently identifies and standardizes item names while maintaining data integrity.",
            verbose=False,
            llm=llm
        )

        classifier = Agent(
            role="Food Classifier",
            goal="Classify food items as fruits/vegetables or other food categories.",
            backstory="An expert in food classification with deep knowledge of ingredients and food categories.",
            verbose=False,
            llm=llm
        )

        data_formatter = Agent(
            role="Data Formatter",
            goal="Format extracted data into consistent JSON structure.",
            backstory="An expert in data standardization and formatting with attention to detail.",
            verbose=False,
            llm=llm
        )

        extract_task = Task(
            description=(
                f"Extract only **food-related** items from the following invoice text:\n{extracted_text}\n"
                "Focus on extracting details such as **product name/title** and **quantity**. "
                "Ignore non-food-related entries such as electronics, furniture, or services. "
            ),
            expected_output="A list where each object contains: `name` (product title) and `quantity` (numeric).",
            agent=extractor
        )

        extract_crew = Crew(
            agents=[extractor],
            tasks=[extract_task],
            verbose=False,
            process=Process.sequential
        )

        initial_result = extract_crew.kickoff()

        try:
            extracted_items = initial_result.raw

            if isinstance(extracted_items, str):
                extracted_items = json.loads(extracted_items)

            if not isinstance(extracted_items, list):
                return {"error": "Invalid output format from CrewAI"}

            classify_task = Task(
                description=(
                    f"Classify each food item as a fruit/vegetable (true) or other food (false):\n{json.dumps(extracted_items)}"
                ),
                expected_output="A list where each object contains: `name` (product title), `quantity` (numeric), `is_vegetable_or_fruit` (boolean).",
                agent=classifier
            )

            format_task = Task(
                description=(
                    "Format the classified data into a consistent JSON structure with properly named fields."
                ),
                expected_output="A list where each object contains: `name` (product title), `quantity` (numeric), `is_vegetable_or_fruit` (boolean).",
                agent=data_formatter
            )

            classification_crew = Crew(
                agents=[classifier, data_formatter],
                tasks=[classify_task, format_task],
                verbose=False,
                process=Process.sequential
            )

            classification_result = classification_crew.kickoff()
            final_data = classification_result.raw

            if isinstance(final_data, str):
                final_data = json.loads(final_data)

            today = date.today()
            for item in final_data:
                item["itemAdded"] = today.isoformat()
                ingredients_collection.update_one(
                    {"name": item["name"]},
                    {"$set": item},
                    upsert=True
                )

            return {"success": True, "items_processed": len(final_data), "items": final_data}

        except Exception as e:
            return {"error": f"Data processing error: {str(e)}"}

    except Exception as e:
        return {"error": f"Error processing PDF: {str(e)}"}
