# 1. Request Schema
from pydantic import BaseModel, Field

class AuditRequest(BaseModel):
    copy_text: str = Field(..., description="The marketing copy to be audited")
    product_line: str = Field(..., description="Product category e.g., Mobile, Home Appliances")

# 2. Response Schema (Pydantic model that matches the strict JSON output structure)
class BrandAuditResult(BaseModel):
    is_compliant: bool = Field(description="True if copy follows brand rules, false otherwise")
    confidence_score: float = Field(description="Confidence rating between 0.0 and 1.0")
    detected_violations: list[str] = Field(description="List of specific rule violations found")
    suggested_rewrite: str = Field(description="Compliant version of the copy")
