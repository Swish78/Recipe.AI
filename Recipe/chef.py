from crewai import Agent, Task, Crew, LLM, Process
import json
from datetime import datetime
import requests
from database import ingredients_collection, recipes_collection
from config import GROQ_API_KEY, TAVILY_API_KEY, DEFAULT_LLM_MODEL, TAVILY_SEARCH_DEPTH, TAVILY_INCLUDE_DOMAINS, \
    TAVILY_MAX_RESULTS


def get_llm():
    return LLM(model=DEFAULT_LLM_MODEL, api_key=GROQ_API_KEY)


def tavily_search(query):
    url = "https://api.tavily.com/search"
    headers = {
        "content-type": "application/json",
        "Authorization": f"Bearer {TAVILY_API_KEY}"
    }
    payload = {
        "query": query,
        "search_depth": TAVILY_SEARCH_DEPTH,
        "include_domains": TAVILY_INCLUDE_DOMAINS,
        "max_results": TAVILY_MAX_RESULTS
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()


def check_dietary_restrictions():
    llm = get_llm()

    cultural_researcher = Agent(
        role="Cultural Food Researcher",
        goal="Identify current festivals and associated dietary restrictions.",
        backstory="An expert in cultural food practices and dietary restrictions related to Hindu festivals and holidays. Avoid beef and pork",
        verbose=False,
        llm=llm
    )

    today = datetime.now().strftime("%B %d")

    search_results = tavily_search(f"dietary restrictions or food restrictions during {today} festivals or holidays")
    search_content = "\n".join([result.get("content", "") for result in search_results.get("results", [])])

    research_task = Task(
        description=(
            f"Today is {today}. Based on the following search results, identify any religious or cultural festivals related to hinduism."
            f"occurring today and their associated dietary restrictions:\n{search_content}\n"
            "Focus on restrictions related to vegetarianism, beef, pork, or other significant food restrictions."
        ),
        expected_output="A list of dietary restrictions in JSON format with each restriction as a string.",
        agent=cultural_researcher
    )

    crew = Crew(
        agents=[cultural_researcher],
        tasks=[research_task],
        verbose=False,
    )

    result = crew.kickoff()

    try:
        restrictions = result.raw
        if isinstance(restrictions, str):
            restrictions = json.loads(restrictions)

        return restrictions if isinstance(restrictions, list) else []
    except:
        return []


def create_recipe_crew(recipe_type, ingredients):
    llm = get_llm()

    # Initialize agents
    recipe_creator = Agent(
        role="Recipe Creator",
        goal="Create delicious recipes based on available ingredients.",
        backstory="A professional chef with expertise in creating recipes from available ingredients.",
        verbose=False,
        llm=llm
    )

    web_researcher = Agent(
        role="Web Researcher",
        goal="Find popular recipes and cooking techniques online.",
        backstory="A culinary researcher who finds the best recipes and cooking methods online.",
        verbose=False,
        llm=llm
    )

    nutritionist = Agent(
        role="Nutritionist",
        goal="Ensure recipes are balanced and healthy.",
        backstory="A certified nutritionist who specializes in creating balanced meals.",
        verbose=False,
        llm=llm
    )

    food_pairing_expert = Agent(
        role="Food Pairing Expert",
        goal="Suggest complementary flavors and ingredients.",
        backstory="A culinary expert specializing in food pairings and flavor combinations.",
        verbose=False,
        llm=llm
    )

    recipe_formatter = Agent(
        role="Recipe Formatter",
        goal="Format recipes into clear, structured instructions.",
        backstory="A technical writer specializing in recipe documentation and formatting.",
        verbose=False,
        llm=llm
    )

    dietary_restrictions = check_dietary_restrictions()

    ingredient_list = [f"{item['name']} ({item['quantity']})" for item in ingredients]

    if recipe_type == 1:
        # Strictly available ingredients
        task_description = f"Create a recipe using ONLY these ingredients: {', '.join(ingredient_list)}. "
        if dietary_restrictions:
            task_description += f"Respect these dietary restrictions: {', '.join(dietary_restrictions)}. "

        pairing_task = Task(
            description=f"Analyze the following ingredients and suggest optimal flavor combinations: {', '.join(ingredient_list)}",
            expected_output="A list of complementary flavor combinations.",
            agent=food_pairing_expert
        )

        recipe_task = Task(
            description=task_description,
            expected_output="A recipe with title, ingredients, and steps.",
            agent=recipe_creator
        )

        nutrition_task = Task(
            description="Evaluate the nutritional balance of the recipe and suggest modifications if needed.",
            expected_output="An analysis of the recipe's nutritional balance.",
            agent=nutritionist
        )

        format_task = Task(
            description="Format the recipe into a clear JSON structure with name, is_veg (boolean), ingredients (list of strings), and steps (list of strings).",
            expected_output="A formatted recipe in JSON format.",
            agent=recipe_formatter
        )

        return Crew(
            agents=[food_pairing_expert, recipe_creator, nutritionist, recipe_formatter],
            tasks=[pairing_task, recipe_task, nutrition_task, format_task],
            verbose=False,
            process=Process.sequential
        )

    elif recipe_type == 2:
        # Available + 1-2 new ingredients
        task_description = f"Create a recipe using these available ingredients: {', '.join(ingredient_list)} plus 1-2 additional ingredients of your choice. "
        if dietary_restrictions:
            task_description += f"Respect these dietary restrictions: {', '.join(dietary_restrictions)}. "

        suggest_task = Task(
            description=f"Suggest 1-2 additional ingredients that would complement these ingredients: {', '.join(ingredient_list)}",
            expected_output="A list of 1-2 complementary ingredients.",
            agent=food_pairing_expert
        )
        recipe_task = Task(
            description=task_description,
            expected_output="A recipe with title, ingredients, and steps.",
            agent=recipe_creator
        )

        nutrition_task = Task(
            description="Evaluate the nutritional balance of the recipe and suggest modifications if needed.",
            expected_output="An analysis of the recipe's nutritional balance.",
            agent=nutritionist
        )

        format_task = Task(
            description="Format the recipe into a clear JSON structure with name, is_veg (boolean), ingredients (list of strings), and steps (list of strings).",
            expected_output="A formatted recipe in JSON format.",
            agent=recipe_formatter
        )

        return Crew(
            agents=[food_pairing_expert, recipe_creator, nutritionist, recipe_formatter],
            tasks=[suggest_task, recipe_task, nutrition_task, format_task],
            verbose=False,
            process=Process.sequential
        )

    else:  # recipe_type == 3
        # Completely new recipe
        search_task = Task(
            description="Search for popular recipes online. Return 3 recipe ideas in JSON format.",
            expected_output="Three recipe ideas in JSON format.",
            agent=web_researcher
        )

        task_description = "Create a completely new recipe idea. "
        if dietary_restrictions:
            task_description += f"Respect these dietary restrictions: {', '.join(dietary_restrictions)}. "

        recipe_task = Task(
            description=task_description,
            expected_output="A recipe with title, ingredients, and steps.",
            agent=recipe_creator
        )

        nutrition_task = Task(
            description="Evaluate the nutritional balance of the recipe and suggest modifications if needed.",
            expected_output="An analysis of the recipe's nutritional balance.",
            agent=nutritionist
        )

        format_task = Task(
            description="Format the recipe into a clear JSON structure with name, is_veg (boolean), ingredients (list of strings), and steps (list of strings).",
            expected_output="A formatted recipe in JSON format.",
            agent=recipe_formatter
        )

        return Crew(
            agents=[web_researcher, recipe_creator, nutritionist, recipe_formatter],
            tasks=[search_task, recipe_task, nutrition_task, format_task],
            verbose=False,
            process=Process.sequential
        )


def get_recipe_suggestions(ingredients):
    llm = get_llm()

    suggestion_agent = Agent(
        role="Recipe Suggestion Expert",
        goal="Suggest recipe ideas based on available ingredients.",
        backstory="A culinary expert who specializes in creating recipe ideas from available ingredients.",
        verbose=False,
        llm=llm
    )

    ingredient_list = [item['name'] for item in ingredients]

    suggestion_task = Task(
        description=f"Suggest 5 recipe ideas using some or all of these ingredients: {', '.join(ingredient_list)}",
        expected_output="A list of 5 recipe ideas in JSON format with name and brief description.",
        agent=suggestion_agent
    )

    crew = Crew(
        agents=[suggestion_agent],
        tasks=[suggestion_task],
        verbose=False
    )

    result = crew.kickoff()

    try:
        if hasattr(result, 'raw'):
            suggestions = result.raw
        elif hasattr(result, 'json_dict'):
            suggestions = result.json_dict
        else:
            suggestions = str(result)
            
        if isinstance(suggestions, str):
            suggestions = json.loads(suggestions)

        return suggestions
    except Exception as e:
        raise Exception(f"Error generating suggestions: {str(e)}")
