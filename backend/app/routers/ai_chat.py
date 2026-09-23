import os
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..deps import get_db, get_current_user
from ..models import User
from .dashboard import get_dashboard_stats

# Attempt to import google.genai
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # 'user' or 'model'
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: dict | None = None # e.g. {"customer_id": "123", "risk": "High"}

SYSTEM_PROMPT = """
You are the "ChurnGuard AI Assistant", an expert financial retention analyst and data scientist built directly into the ChurnGuard enterprise platform.

CRITICAL RULES:
1. You may ONLY answer questions related to customer churn, financial retention strategies, predictive risk models, or the data currently on the dashboard.
2. If the user asks about coding, history, general knowledge, or anything outside the scope of banking churn and data analytics, you MUST politely refuse and remind them of your purpose.
3. You have access to contextual data provided by the frontend. If context is provided, use it to give highly specific, actionable retention advice without asking the user to repeat the numbers.
4. Keep answers concise, professional, and formatted in Markdown.
"""

@router.post("")
def chat_with_ai(
    req: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not HAS_GENAI or not api_key:
        raise HTTPException(
            status_code=503, 
            detail="AI features are not configured. Missing GEMINI_API_KEY in environment."
        )

    client = genai.Client(api_key=api_key)
    
    # Format history for Gemini API using google-genai types
    contents = []
    # All messages except the last one are history
    for msg in req.messages[:-1]:
        role = "user" if msg.role == "user" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=msg.content)])
        )
        
    # Fetch user org stats for context
    try:
        org_stats = get_dashboard_stats(db=db, current_user=current_user)
        user_role = getattr(current_user, "role", "Viewer")
        
        # Define role-specific behavioral instructions
        role_instructions = ""
        if user_role == "Super Admin" or user_role == "Org Admin":
            role_instructions = "You are speaking to an Administrator. You can advise on system settings, user management, and high-level strategic risk."
        elif user_role == "Data Analyst":
            role_instructions = "You are speaking to a Data Analyst. Feel free to use technical data science terms, discuss model performance (ROC, AUC, feature drift), and explain the underlying ML models."
        else:
            role_instructions = "You are speaking to a Viewer. Keep your insights high-level and focused on business value and customer retention strategies."
            
        global_context = f"Company Metrics: {org_stats['metrics']['total_customers']} total customers, {org_stats['metrics']['high_risk_customers']} high risk, {org_stats['metrics']['churn_rate']}% churn rate. Model Confidence: {org_stats['metrics']['model_confidence']}%.\nUser Role: {user_role}\nRole Instructions: {role_instructions}"
    except Exception:
        global_context = f"Company Metrics: Not available. User Role: {getattr(current_user, 'role', 'Unknown')}"

    # Format the latest user prompt, injecting context if available
    latest_msg = req.messages[-1].content
    context_str = global_context
    if req.context:
        page_context = "\n".join([f"- {k}: {v}" for k, v in req.context.items()])
        context_str += f"\nPage Context (what they are looking at right now):\n{page_context}"
        
    full_prompt = f"[SYSTEM CONTEXT - READ ALL APP DATA]\n{context_str}\n[END CONTEXT]\n\nUser Question: {latest_msg}"

    contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=full_prompt)])
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT
            )
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
