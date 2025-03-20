from dotenv import load_dotenv
import os

load_dotenv()

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "recipe_ai"
INGREDIENTS_COLLECTION = "ingredients"
RECIPES_COLLECTION = "recipes"

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

# LLM Models
DEFAULT_LLM_MODEL = "groq/gemma2-9b-it"
LLAMA_MODEL = "groq/llama-3.3-70b-versatile"

# Tavily search configuration
TAVILY_SEARCH_DEPTH = "advanced"
TAVILY_INCLUDE_DOMAINS = [
    "food.com", 
    "allrecipes.com", 
    "epicurious.com", 
    "foodnetwork.com", 
    "bbcgoodfood.com"
]
TAVILY_MAX_RESULTS = 5

FOOD_EXPIRY_DAYS = 5