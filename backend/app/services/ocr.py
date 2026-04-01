"""
app/services/ocr.py — Extract text from uploaded PDFs and images
"""
import io
import logging
from pathlib import Path

import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import PyPDF2

logger = logging.getLogger(__name__)


def _preprocess_image(img: Image.Image) -> Image.Image:
    """Enhance image contrast and sharpness before OCR."""
    img = img.convert("L")                              # grayscale
    img = ImageEnhance.Contrast(img).enhance(2.0)
    img = img.filter(ImageFilter.SHARPEN)
    return img


def extract_text_from_image(file_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """Run Tesseract OCR on a raw image bytes buffer."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img = _preprocess_image(img)
        text = pytesseract.image_to_string(img, config="--psm 6")
        return text.strip()
    except Exception as exc:
        logger.error("OCR image extraction failed: %s", exc)
        raise RuntimeError("OCR failed on image") from exc


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from a PDF.
    Tries text-layer first (fast); falls back to page-image OCR for scanned PDFs.
    """
    text_parts: list[str] = []
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            text_parts.append(page.extract_text() or "")
    except Exception as exc:
        logger.error("PDF text extraction failed: %s", exc)

    combined = "\n".join(text_parts).strip()
    if len(combined) > 100:  # enough real text — skip OCR
        return combined

    # Fallback: render pages as images → OCR (requires pdf2image / poppler)
    try:
        from pdf2image import convert_from_bytes  # optional heavy dependency
        images = convert_from_bytes(file_bytes, dpi=200)
        ocr_parts = [pytesseract.image_to_string(_preprocess_image(img)) for img in images]
        return "\n".join(ocr_parts).strip()
    except ImportError:
        logger.warning("pdf2image not installed; returning partial text")
        return combined
    except Exception as exc:
        logger.error("PDF OCR fallback failed: %s", exc)
        return combined


def extract_text(file_bytes: bytes, file_name: str) -> str:
    """Dispatch to the right extractor based on file extension."""
    ext = Path(file_name).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in {".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"}:
        return extract_text_from_image(file_bytes)
    else:
        # Assume plain text
        return file_bytes.decode("utf-8", errors="replace")
