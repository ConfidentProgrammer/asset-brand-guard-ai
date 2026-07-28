from fastapi import File, UploadFile, Form, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from dotenv import load_dotenv
from google.genai import types
import json
from app.schema.schema import AuditRequest, BrandAuditResult
from app.config import genai_client,pinecone_client
from app.services.rag_service import get_rules
load_dotenv()


app = FastAPI(title="AssetBrandGuard Gemini Enterprise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/audit-copy", response_model=BrandAuditResult)
async def audit_marketing_copy(payload: AuditRequest):
    try:
        # Initialize the Google GenAI client using GEMINI_API_KEY from environment variables
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
        response = genai_client.models.generate_content(
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

@app.post("/api/v1/audit-image", response_model=BrandAuditResult)
async def audit_image(
    file: UploadFile = File(...),
    product_line: str = Form(...)
):
    try:
        # 1. Read image raw bytes from the uploaded file
        image_bytes = await file.read()
        
        # 2. Fetch relevant brand design/visual rules using RAG
        # We use a descriptive query text contextually linked to the product line
        rules = get_rules(f"visual guidelines layout logo positioning for {product_line}", product_line)
        
        # 3. Construct prompt and format image payload for Gemini 2.5 Flash
        prompt = f"""
        Analyze this marketing asset/image against the following brand compliance rules:
        {rules}
        
        Determine if the asset adheres to the brand guidelines. Provide a structured audit result.
        """
        
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=file.content_type or "image/jpeg"
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=BrandAuditResult,
                temperature=0.1
            ),
        )
        
        return BrandAuditResult(**json.loads(response.text))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()