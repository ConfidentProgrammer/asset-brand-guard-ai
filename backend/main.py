from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from dotenv import load_dotenv
from google.genai import types
import os
import json
from pinecone import Pinecone

load_dotenv()
app = FastAPI(title="AssetBrandGuard Gemini Enterprise API", version="1.0.0")

pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index("asset-brand-guard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Request Schema
class AuditRequest(BaseModel):
    copy_text: str = Field(..., description="The marketing copy to be audited")
    product_line: str = Field(..., description="Product category e.g., Mobile, Home Appliances")

# 2. Response Schema (Pydantic model that matches the strict JSON output structure)
class BrandAuditResult(BaseModel):
    is_compliant: bool = Field(description="True if copy follows brand rules, false otherwise")
    confidence_score: float = Field(description="Confidence rating between 0.0 and 1.0")
    detected_violations: list[str] = Field(description="List of specific rule violations found")
    suggested_rewrite: str = Field(description="Compliant version of the copy")

def get_rules(payload: AuditRequest):
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    query_response = client.models.embed_content(
                model="models/gemini-embedding-001",
                contents=payload.copy_text,
                config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY"
                )
            )
    
    query_vector = query_response.embeddings[0].values

    search_results = index.query(
            vector=query_vector,
            top_k=3,
            include_metadata=True,
            filter={"product_line": payload.product_line},
            )

    retrieved_rules = [match["metadata"]["text"] for match in search_results["matches"]]

    return {"retrieved_rules": retrieved_rules}
    

@app.post("/api/v1/audit-copy", response_model=BrandAuditResult)
async def audit_marketing_copy(payload: AuditRequest):
    try:
        # Initialize the Google GenAI client using GEMINI_API_KEY from environment variables
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        brand_guidelines_context = get_rules(payload)
        # Construct the prompt instructing Gemini to return strict JSON matching our Pydantic schema
        prompt = f"""
        You are a strict enterprise brand compliance validator for global electronics.
        Analyze the input copy against these guidelines:
        {brand_guidelines_context['retrieved_rules']}

        Product Line: {payload.product_line}
        Copy to Audit: {payload.copy_text}
        """

        # Call Gemini model (gem-2.5-flash or gemini-2.5-pro) with structural json configuration
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=BrandAuditResult,
                temperature=0.1,
            ),
        )
        
        # Gemini automatically guarantees the output adheres to the Pydantic schema when response_schema is passed
        result_data = json.loads(response.text)
        return BrandAuditResult(**result_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))