from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from datetime import datetime
import redis
import json
import joblib
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(title="League ML Service", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://jonathonthompson.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)

# Champion data (simplified - in production, load from database)
CHAMPIONS = {
    "Aatrox": {"id": 1, "role": "top", "damage_type": "physical"},
    "Ahri": {"id": 2, "role": "mid", "damage_type": "magic"},
    "Akali": {"id": 3, "role": "mid", "damage_type": "mixed"},
    "Alistar": {"id": 4, "role": "support", "damage_type": "magic"},
    "Amumu": {"id": 5, "role": "jungle", "damage_type": "magic"},
    "Anivia": {"id": 6, "role": "mid", "damage_type": "magic"},
    "Annie": {"id": 7, "role": "mid", "damage_type": "magic"},
    "Aphelios": {"id": 8, "role": "adc", "damage_type": "physical"},
    "Ashe": {"id": 9, "role": "adc", "damage_type": "physical"},
    "Azir": {"id": 10, "role": "mid", "damage_type": "magic"},
    # Add more champions as needed
}

# Request/Response models
class DraftRequest(BaseModel):
    team_picks: List[str]
    enemy_picks: List[str]
    team_bans: List[str]
    enemy_bans: List[str]
    role: str
    player_champion_pool: Optional[List[str]] = None

class ChampionRecommendation(BaseModel):
    champion: str
    score: float
    win_rate: float
    reasons: List[str]
    synergies: List[str]
    counters: List[str]

class DraftResponse(BaseModel):
    recommendations: List[ChampionRecommendation]
    team_composition_score: float
    damage_distribution: Dict[str, float]
    team_strengths: List[str]
    team_weaknesses: List[str]

class MatchPredictionRequest(BaseModel):
    blue_team: List[str]
    red_team: List[str]
    blue_team_ranks: Optional[List[str]] = None
    red_team_ranks: Optional[List[str]] = None

class MatchPredictionResponse(BaseModel):
    blue_win_probability: float
    red_win_probability: float
    key_factors: List[str]
    predicted_game_length: int
    confidence: float

# ML Models (mock implementations - replace with real models)
class DraftAssistant:
    def __init__(self):
        # In production, load pre-trained models
        self.synergy_matrix = self._generate_mock_synergy_matrix()
        self.counter_matrix = self._generate_mock_counter_matrix()
        self.win_rates = self._generate_mock_win_rates()
    
    def _generate_mock_synergy_matrix(self):
        # Mock synergy scores between champions
        return np.random.rand(len(CHAMPIONS), len(CHAMPIONS))
    
    def _generate_mock_counter_matrix(self):
        # Mock counter scores between champions
        return np.random.rand(len(CHAMPIONS), len(CHAMPIONS))
    
    def _generate_mock_win_rates(self):
        # Mock win rates for each champion
        return {champ: 0.45 + np.random.rand() * 0.1 for champ in CHAMPIONS}
    
    def recommend_champions(self, request: DraftRequest) -> List[ChampionRecommendation]:
        available_champions = [
            champ for champ in CHAMPIONS 
            if champ not in request.team_picks + request.enemy_picks + request.team_bans + request.enemy_bans
            and CHAMPIONS[champ]["role"] == request.role
        ]
        
        recommendations = []
        for champion in available_champions[:5]:  # Top 5 recommendations
            score = np.random.rand()
            win_rate = self.win_rates.get(champion, 0.5)
            
            recommendation = ChampionRecommendation(
                champion=champion,
                score=round(score * 100, 2),
                win_rate=round(win_rate * 100, 2),
                reasons=[
                    f"Strong against {request.enemy_picks[0] if request.enemy_picks else 'enemy comp'}",
                    f"Good synergy with {request.team_picks[0] if request.team_picks else 'your team'}",
                    "Currently meta pick"
                ],
                synergies=request.team_picks[:2] if request.team_picks else [],
                counters=request.enemy_picks[:2] if request.enemy_picks else []
            )
            recommendations.append(recommendation)
        
        return sorted(recommendations, key=lambda x: x.score, reverse=True)
    
    def analyze_team_composition(self, team_picks: List[str]) -> Dict:
        damage_dist = {
            "physical": sum(1 for champ in team_picks if CHAMPIONS.get(champ, {}).get("damage_type") == "physical"),
            "magic": sum(1 for champ in team_picks if CHAMPIONS.get(champ, {}).get("damage_type") == "magic"),
            "mixed": sum(1 for champ in team_picks if CHAMPIONS.get(champ, {}).get("damage_type") == "mixed")
        }
        
        total = sum(damage_dist.values()) or 1
        damage_distribution = {k: v/total for k, v in damage_dist.items()}
        
        # Mock analysis
        strengths = []
        weaknesses = []
        
        if damage_distribution["physical"] > 0.6:
            weaknesses.append("Heavy physical damage - vulnerable to armor stacking")
        elif damage_distribution["magic"] > 0.6:
            weaknesses.append("Heavy magic damage - vulnerable to MR stacking")
        else:
            strengths.append("Balanced damage distribution")
        
        if len(team_picks) >= 3:
            strengths.append("Strong team fighting potential")
            strengths.append("Good objective control")
        
        return {
            "damage_distribution": damage_distribution,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "score": 75.0 + np.random.rand() * 20
        }

class MatchPredictor:
    def __init__(self):
        # In production, load pre-trained model
        pass
    
    def predict_match(self, request: MatchPredictionRequest) -> MatchPredictionResponse:
        # Mock prediction logic
        blue_score = len(request.blue_team) * np.random.rand()
        red_score = len(request.red_team) * np.random.rand()
        
        total_score = blue_score + red_score
        blue_prob = blue_score / total_score if total_score > 0 else 0.5
        red_prob = 1 - blue_prob
        
        key_factors = [
            "Blue team has stronger early game",
            "Red team has better late game scaling",
            "Team composition synergy favors blue team"
        ]
        
        return MatchPredictionResponse(
            blue_win_probability=round(blue_prob * 100, 2),
            red_win_probability=round(red_prob * 100, 2),
            key_factors=key_factors,
            predicted_game_length=25 + int(np.random.rand() * 20),
            confidence=0.75 + np.random.rand() * 0.2
        )

# Initialize ML models
draft_assistant = DraftAssistant()
match_predictor = MatchPredictor()

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "League ML Service",
        "status": "operational",
        "endpoints": [
            "/draft/recommend",
            "/match/predict",
            "/champion/stats",
            "/health"
        ]
    }

@app.get("/health")
async def health_check():
    try:
        # Check Redis connection
        redis_client.ping()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "redis": "connected",
                "ml_models": "loaded"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/draft/recommend", response_model=DraftResponse)
async def recommend_draft(request: DraftRequest):
    try:
        # Get recommendations
        recommendations = draft_assistant.recommend_champions(request)
        
        # Analyze team composition
        comp_analysis = draft_assistant.analyze_team_composition(request.team_picks)
        
        # Cache results
        cache_key = f"draft:{hash(str(request.dict()))}"
        redis_client.setex(
            cache_key,
            300,  # 5 minutes TTL
            json.dumps({
                "recommendations": [r.dict() for r in recommendations],
                "analysis": comp_analysis
            })
        )
        
        return DraftResponse(
            recommendations=recommendations,
            team_composition_score=comp_analysis["score"],
            damage_distribution=comp_analysis["damage_distribution"],
            team_strengths=comp_analysis["strengths"],
            team_weaknesses=comp_analysis["weaknesses"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Draft recommendation error: {str(e)}")

@app.post("/match/predict", response_model=MatchPredictionResponse)
async def predict_match(request: MatchPredictionRequest):
    try:
        prediction = match_predictor.predict_match(request)
        
        # Cache results
        cache_key = f"prediction:{hash(str(request.dict()))}"
        redis_client.setex(
            cache_key,
            300,  # 5 minutes TTL
            json.dumps(prediction.dict())
        )
        
        return prediction
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Match prediction error: {str(e)}")

@app.get("/champion/stats/{champion_name}")
async def get_champion_stats(champion_name: str):
    if champion_name not in CHAMPIONS:
        raise HTTPException(status_code=404, detail="Champion not found")
    
    # Mock champion statistics
    stats = {
        "champion": champion_name,
        "win_rate": round(48 + np.random.rand() * 6, 2),
        "pick_rate": round(2 + np.random.rand() * 10, 2),
        "ban_rate": round(1 + np.random.rand() * 20, 2),
        "avg_kda": round(2 + np.random.rand() * 2, 2),
        "role_distribution": {
            CHAMPIONS[champion_name]["role"]: 0.8,
            "other": 0.2
        },
        "best_items": [
            "Infinity Edge",
            "Kraken Slayer",
            "Lord Dominik's Regards"
        ],
        "skill_order": "Q > E > W",
        "counters": list(CHAMPIONS.keys())[:3],
        "synergies": list(CHAMPIONS.keys())[3:6]
    }
    
    return stats

@app.post("/train/update")
async def update_model(api_key: str):
    # In production, validate API key and trigger model retraining
    if api_key != "your-secret-api-key":
        raise HTTPException(status_code=403, detail="Invalid API key")
    
    return {
        "status": "Model update initiated",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)