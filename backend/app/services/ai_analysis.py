"""
app/services/ai_analysis.py - Gemini-based medical report analysis
"""
import asyncio
import json
import logging
from typing import Any

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are an expert medical report analysis assistant. Your role is to:
1. Parse structured medical lab data from report text
2. Identify abnormal values and their clinical significance
3. Explain findings in simple, non-technical language for patients

Always respond with a single valid JSON object - no markdown fences, no extra text.

Required schema:
{
  "reportName": "string - type of medical report",
  "summary": "string - 2-4 sentence plain-language summary for a non-medical person",
  "parameters": [
    {
      "name": "string",
      "value": "string - numeric value",
      "unit": "string",
      "range": "string - normal reference range",
      "status": "normal | high | low | borderline",
      "barPercent": integer 0-100,
      "explanation": "string - one plain-language sentence"
    }
  ],
  "recommendations": [
    { "icon": "emoji", "text": "string - actionable advice" }
  ],
  "overallStatus": "normal | attention | critical"
}

Rules:
- barPercent: 50 = centre of normal, <30 = trending low, >70 = trending high, use 85+ for clearly abnormal
- Include 4-8 of the most important parameters
- Recommendations should be practical and non-alarmist
- Never diagnose; always recommend consulting a doctor for abnormal results
"""


async def analyze_report(raw_text: str) -> dict[str, Any]:
    """
    Send extracted report text to Gemini and return structured analysis.
    Raises RuntimeError on API failure.
    """
    if not raw_text or len(raw_text.strip()) < 20:
        raise ValueError("Report text is too short to analyse")

    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=f"Please analyse this medical report:\n\n{raw_text}",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                max_output_tokens=1500,
                response_mime_type="application/json",
            ),
        )

        raw_json = (response.text or "").strip()
        raw_json = raw_json.replace("```json", "").replace("```", "").strip()
        if not raw_json:
            raise RuntimeError("Gemini returned an empty response")
        return json.loads(raw_json)

    except json.JSONDecodeError as exc:
        logger.error("Gemini returned non-JSON: %s", exc)
        raise RuntimeError("AI response was not valid JSON") from exc
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        raise RuntimeError(f"AI service error: {exc}") from exc


def count_flags(parameters: list[dict]) -> int:
    """Return number of non-normal parameters."""
    return sum(1 for p in parameters if p.get("status") != "normal")
