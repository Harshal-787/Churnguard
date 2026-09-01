import os
import json
from google import genai
from dotenv import load_dotenv
from pathlib import Path

def generate_retention_strategy(customer_data: dict, shap_factors: list) -> dict:
    """Generates a personalized retention strategy using Gemini."""
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY is not set."}
        
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert Customer Success Manager and Data Analyst.
    A predictive machine learning model has flagged this customer as high risk for churn.
    
    Customer Profile:
    {json.dumps(customer_data, indent=2)}
    
    Top Risk Factors (SHAP Values - what is driving the risk):
    {json.dumps(shap_factors, indent=2)}
    
    Please provide a concise, actionable retention strategy tailored to this exact user.
    Return your response strictly in the following JSON format:
    {{
        "action_plan": "A concise paragraph (2-3 sentences max) detailing the retention strategy and specific action items to prevent churn.",
        "risk_factor": "The single biggest risk factor extracted from the profile and SHAP values, formatted as a short, human-readable phrase (e.g. 'Declining Balance' or 'High Support Tickets')."
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}
