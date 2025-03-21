from pymongo import MongoClient
from pymongo.server_api import ServerApi
import json
from bson.objectid import ObjectId
from datetime import datetime, date, timedelta
from config import MONGODB_URI, DB_NAME, INGREDIENTS_COLLECTION, RECIPES_COLLECTION


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime, date):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)


client = None
db = None
ingredients_collection = None
recipes_collection = None

def init_db():
    global client, db, ingredients_collection, recipes_collection
    try:
        client = MongoClient(MONGODB_URI, TLS=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000, server_api=ServerApi('1'))
        client.server_info()
        db = client[DB_NAME]
        ingredients_collection = db[INGREDIENTS_COLLECTION]
        recipes_collection = db[RECIPES_COLLECTION]
        print("Successfully connected to MongoDB.")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        raise

init_db()
