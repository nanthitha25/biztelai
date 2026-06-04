import base64
import io
import json
import os
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from PIL import Image

# 1. Define schema for individual row extraction
class OperationalRow(BaseModel):
    s_no: int = Field(description="Serial number of the row")
    date: str = Field(description="Standardized date in YYYY-MM-DD format")
    shift: int = Field(description="Standardized shift integer (1, 2, or 3). Convert Roman numerals like I, II, III to 1, 2, 3.")
    employee_number: str = Field(description="Employee number, ignore crossed out or scribbled text, extract the final visible ID.")
    operation_code: str = Field(description="Operation code sequence")
    machine_number: str = Field(description="Machine number string (e.g., MC-730)")
    work_order_number: str = Field(description="Work order tracking number")
    quantity_produced: Optional[int] = Field(description="Total quantity produced. Set null if blank.")
    time_taken_hours: float = Field(description="Time spent on the operation in hours")
    ai_confidence: float = Field(description="Confidence rating between 0.0 and 1.0 based on handwriting legibility")

class OperationalLogSchema(BaseModel):
    records: List[OperationalRow]

# 2. Extract engine processing image byte streams
def extract_operational_data(image_bytes: bytes, mime_type: str) -> List[dict]:
    # Initializes using GEMINI_API_KEY automatically
    client = genai.Client()

    # Convert raw bytes to PIL Image for Gemini
    image = Image.open(io.BytesIO(image_bytes))

    prompt = (
        "You are an industrial data validation engine scanning handwritten factory sheets. "
        "Extract every completed or partially completed entry row from the data table. "
        "Ignore crossed-out text or corrections; capture the final intended value. "
        "Convert Roman numeral shifts (I, II, III) natively into numerical integers (1, 2, 3)."
    )

    # Request structured JSON matching your schema natively
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[image, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=OperationalLogSchema,
            temperature=0.0
        ),
    )

    data = json.loads(response.text)
    return data["records"]
