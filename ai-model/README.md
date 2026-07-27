# RinCon FutBuk — AI Recommendation Service

## Setup

### 1. Make sure Python 3.9+ is installed
```bash
python --version
```

### 2. Create a virtual environment (recommended)
```bash
cd ai-model
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac / Linux:
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Flask server
```bash
python app.py
```

The AI service will start at **http://localhost:5001**

---

## API Endpoints

### GET /health
Check that the service is running.

### POST /recommend/nearest
Find the nearest futsals to the user's GPS location.

**Body:**
```json
{ "lat": 27.7172, "lng": 85.3240, "top_n": 5 }
```

### POST /recommend/popular
Recommend futsals by popularity (booking count).
Optionally pass user_id to boost futsals the user has visited before.

**Body:**
```json
{ "user_id": 3, "top_n": 5 }
```

---

## How it works

- **Nearest**: Uses scikit-learn `NearestNeighbors` with the Haversine metric
  to find futsals closest to the user's location (requires lat/lng in DB).
- **Popular**: Uses numpy to score futsals by confirmed booking count,
  with a personal history boost if the user has visited before.

---

## Running all 3 servers together

| Service   | Command              | Port |
|-----------|----------------------|------|
| Backend   | `node index.js`      | 5000 |
| AI Model  | `python app.py`      | 5001 |
| Frontend  | `npm run dev`        | 5173 |
