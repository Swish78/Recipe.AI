from pymongo import MongoClient
import json
from bson.objectid import ObjectId
from datetime import datetime, date
from config import MONGODB_URI, DB_NAME, INGREDIENTS_COLLECTION, RECIPES_COLLECTION


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)


# Database connection
client = MongoClient(MONGODB_URI, TLS=True, tlsAllowInvalidCertificates=True)
db = client[DB_NAME]
ingredients_collection = db[INGREDIENTS_COLLECTION]
recipes_collection = db[RECIPES_COLLECTION]