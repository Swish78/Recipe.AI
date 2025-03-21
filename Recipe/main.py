from flask import Flask
from flask_cors import CORS
from routes.invoice_routes import invoice_bp
from routes.ingredient_routes import ingredient_bp
from routes.recipe_routes import recipe_bp
from database import JSONEncoder

app = Flask(__name__)
CORS(app , resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*", "allow_methods": "*"}})

app.json_encoder = JSONEncoder

app.register_blueprint(invoice_bp, url_prefix='/api')
app.register_blueprint(ingredient_bp, url_prefix='/api')
app.register_blueprint(recipe_bp, url_prefix='/api')

app.get("/")(lambda: "Welcome to the Recipe API!")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
