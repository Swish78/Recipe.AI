from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from models import Ingredients
from database import ingredients_collection
from config import FOOD_EXPIRY_DAYS

ingredient_bp = Blueprint('ingredient', __name__)


@ingredient_bp.route('/add-ingredient', methods=['POST'])
def add_ingredient():
    data = request.json
    try:
        item = Ingredients(**data)
        ingredients_collection.update_one(
            {"name": item.name},
            {"$set": item.dict()},
            upsert=True
        )
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@ingredient_bp.route('/get-ingredients', methods=['GET'])
def get_ingredients():
    ingredients = list(ingredients_collection.find())
    return jsonify(ingredients)


@ingredient_bp.route('/get-expiring-ingredients', methods=['GET'])
def get_expiring_ingredients():
    expiry_days_ago = datetime.now() - timedelta(days=FOOD_EXPIRY_DAYS)
    expiring = list(ingredients_collection.find({
        "itemAdded": {"$lte": expiry_days_ago.date()},
        "is_vegetable_or_fruit": True
    }))
    return jsonify(expiring)