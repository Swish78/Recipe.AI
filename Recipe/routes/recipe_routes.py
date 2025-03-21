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
        if hasattr(result, 'raw'):
            recipe_data = result.raw
        elif hasattr(result, 'json_dict'):
            recipe_data = result.json_dict
        else:
            recipe_data = str(result)
        if isinstance(recipe_data, str):
            if "```json" in recipe_data:
                json_start = recipe_data.find("```json\n") + 8
                json_end = recipe_data.rfind("```")
                cleaned_json = recipe_data[json_start:json_end].strip()
                try:
                    recipe_data = json.loads(cleaned_json)
                except json.JSONDecodeError:
                    return jsonify({"error": f"Could not parse extracted JSON: {cleaned_json}"}), 500
            else:
                try:
                    recipe_data = json.loads(recipe_data)
                except json.JSONDecodeError:
                    return jsonify({"error": f"Could not parse as JSON: {recipe_data}"}), 500
        if not isinstance(recipe_data, dict):
            return jsonify({"error": f"Unexpected output format: {type(recipe_data)}"}), 500
        if 'ingredients' in recipe_data and 'items' not in recipe_data:
            recipe_data['items'] = recipe_data.pop('ingredients')
            
        if 'steps' in recipe_data and 'instructions' not in recipe_data:
            recipe_data['instructions'] = recipe_data.pop('steps')

        recipe_data["is_recipe"] = True
        recipe_data["is_fav"] = False
        insert_result = recipes_collection.insert_one(recipe_data)
        recipe_data["_id"] = str(insert_result.inserted_id)
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
    try:
        recipes = list(recipes_collection.find())
        for recipe in recipes:
            if '_id' in recipe:
                recipe['_id'] = str(recipe['_id'])
        
        return jsonify(recipes)
    except Exception as e:
        return jsonify({"error": f"Error retrieving recipes: {str(e)}"}), 500


@recipe_bp.route('/get-recipe-suggestions', methods=['GET'])
def get_recipe_suggestions_route():
    try:
        ingredients = list(ingredients_collection.find())
        suggestions = get_recipe_suggestions(ingredients)
        return jsonify(suggestions)
    except Exception as e:
        return jsonify({"error": f"Error generating suggestions: {str(e)}"}), 500


@recipe_bp.route('/delete-recipe/<recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    try:
        from bson import ObjectId
        result = recipes_collection.delete_one({"_id": ObjectId(recipe_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Recipe not found"}), 404
        return jsonify({"success": True, "message": "Recipe deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"Error deleting recipe: {str(e)}"}), 500
