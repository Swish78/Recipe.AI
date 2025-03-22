# 🍳 Recipe.AI - Your Family's Smart Kitchen Assistant

> Never wonder "What's for dinner?" again! Recipe.AI helps manage your kitchen inventory and suggests delicious meals based on what you have.

DEMO: [Video Link](https://s3.us-east-1.amazonaws.com/recipe.ai/Screen+Recording+2025-03-22+at+14.22.14.mov)

## ✨ Features

### 🥗 Smart Inventory Management
- Track all your kitchen ingredients in one place
- Automatic expiry notifications
- Categorize ingredients 
- Real-time quantity tracking

### 📝 Recipe Management
- Store and organize family recipes
- Generate recipe suggestions based on available ingredients
- Support for both vegetarian and non-vegetarian recipes

### 🎯 Smart Meal Planning
- Get AI-powered recipe suggestions
- Avoid food waste with expiry-based recommendations

### 📊 Smart Dashboard
- Visual overview of your kitchen inventory
- Track expiring ingredients
- Monitor ingredient categories
- Quick access to recipe suggestions

## 🛠️ Tech Stack

### Frontend
- React with Vite
- Material-UI (MUI) 

### Backend
- Python Flask
- MongoDB for data storage
- Multiagent support using crewAI
- Tavily for web search results

## 🚀 Getting Started

### Prerequisites
- Node.js and npm
- Python 3.x
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/Recipe.AI.git
cd Recipe.AI
```

2. Set up the backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r r.txt
```

3. Set up the frontend
```bash
cd recipe_frontend
npm install
```

4. Start the application
```bash
# Start the backend (from project root)
python Recipe/main.py

# Start the frontend (in recipe_frontend directory)
npm run dev
```

## 💡 Usage

1. **Add Ingredients**: Start by adding ingredients to your inventory through the Ingredients page
2. **Track Expiry**: Monitor expiring ingredients on the Dashboard
3. **Generate Recipes**: Click "Generate Recipe" to get AI-powered suggestions based on your inventory
4. **Upload Invoices**: Upload your invoices through the Upload Invoices page and get ingredients added automatically
5. **Create Custom Recipes**: Add your family recipes through the Create Recipe page

---

Made with ❤️ for families who love good food and smart organization
