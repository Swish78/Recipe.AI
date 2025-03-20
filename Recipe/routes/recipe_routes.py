from flask import Blueprint, request, jsonify
from models import Notes_Recipe
from database import ingredients_collection, recipes_collection
from chef import create_recipe_crew, get_recipe_suggestions
import json

recipe_bp = Blueprint('recipe', __name__)


@recipe_bp.route('/get-recipe', methods=['POST'])
def get_recipe():
    data = request.json
    recipe_type = data.get('type', 1)  # 1, 2, or 3

    ingredients = list(ingredients_collection.find())
    if not ingredients and recipe_type != 3:
        return jsonify({"error": "No ingredients available"}), 400

    try:
        crew = create_recipe_crew(recipe_type, ingredients)
        result = crew.kickoff()

        recipe_data = result.final_output

        if isinstance(recipe_data, str):
            recipe_data = json.loads(recipe_data)

        recipe_data["is_recipe"] = True
        recipe_data["is_fav"] = False

        recipes_collection.insert_one(recipe_data)

        return jsonify(recipe_data)
    except Exception as e:
        return jsonify({"error": f"Error processing recipe: {str(e)}"}), 500


@recipe_bp.route('/save-recipe', methods=['POST'])
def save_recipe():
    data = request.json
    try:
        recipe = Notes_Recipe(**data)
        recipe_dict = recipe.dict()
        recipe_dict["is_fav"] = True
        recipes_collection.insert_one(recipe_dict)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@recipe_bp.route('/get-recipes', methods=['GET'])
def get_recipes():
    recipes = list(recipes_collection.find())
    return jsonify(recipes)


@recipe_bp.route('/get-recipe-suggestions', methods=['GET'])
def get_recipe_suggestions_route():
    try:
        ingredients = list(ingredients_collection.find())
        suggestions = get_recipe_suggestions(ingredients)
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({"error": f"Error generating suggestions: {str(e)}"}), 500