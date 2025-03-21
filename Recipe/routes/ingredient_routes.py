from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, date
from models import Ingredients
from database import ingredients_collection
from config import FOOD_EXPIRY_DAYS

ingredient_bp = Blueprint('ingredient', __name__)


@ingredient_bp.route('/add-ingredient', methods=['POST'])
def add_ingredient():
    data = request.json
    try:
        item = Ingredients(**data)
        item_dict = item.dict()
        if isinstance(item_dict['itemAdded'], date):
            item_dict['itemAdded'] = item_dict['itemAdded'].isoformat()
            
        ingredients_collection.update_one(
            {"name": item.name},
            {"$set": item_dict},
            upsert=True
        )
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@ingredient_bp.route('/get-ingredients', methods=['GET'])
def get_ingredients():
    try:
        ingredients = list(ingredients_collection.find())
        for ingredient in ingredients:
            if '_id' in ingredient:
                ingredient['_id'] = str(ingredient['_id'])
        return jsonify(ingredients)
    except Exception as e:
        return jsonify({"error": f"Error fetching ingredients: {str(e)}"}), 500


@ingredient_bp.route('/get-expiring-ingredients', methods=['GET'])
def get_expiring_ingredients():
    try:
        expiry_days_ago = datetime.now() - timedelta(days=FOOD_EXPIRY_DAYS)
        expiring = list(ingredients_collection.find({
            "itemAdded": {"$lte": expiry_days_ago.date().isoformat()},
            "is_vegetable_or_fruit": True
        }))
        for ingredient in expiring:
            if '_id' in ingredient:
                ingredient['_id'] = str(ingredient['_id'])
        return jsonify(expiring)
    except Exception as e:
        return jsonify({"error": f"Error fetching expiring ingredients: {str(e)}"}), 500


@ingredient_bp.route('/delete-ingredient/<ingredient_id>', methods=['DELETE'])
def delete_ingredient(ingredient_id):
    try:
        from bson import ObjectId
        result = ingredients_collection.delete_one({"_id": ObjectId(ingredient_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Ingredient not found"}), 404
        return jsonify({"success": True, "message": "Ingredient deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"Error deleting ingredient: {str(e)}"}), 500
