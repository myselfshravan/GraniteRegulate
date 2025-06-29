from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
import fitz  # PyMuPDF
import os
from typing import List
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Adjust this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions (copied from app.py) ---

def extract_text_from_pdf(file_stream):
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text()
    return full_text

def check_gdpr(text: str) -> bool:
    gdpr_keywords = [
        'name', 'email', 'phone', 'address', 'social security', 'account number',
        'ssn', 'telephone', 'cellphone', 'passport', 'driver\'s license'
    ]
    ssn_pattern = r'\d{3}-\d{2}-\d{4}'
    phone_pattern = r'\+?\d{1,4}?[.-]?\(?\d{1,3}?\)?[.-]?\d{1,4}[.-]?\d{1,4}[.-]?\d{1,4}'
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'

    if any(keyword in text.lower() for keyword in gdpr_keywords):
        return True
    if re.search(ssn_pattern, text) or re.search(phone_pattern, text) or re.search(email_pattern, text):
        return True
    return False

def check_phi(text: str) -> bool:
    health_keywords = ['patient', 'medical', 'doctor', 'condition', 'treatment', 'prescription']
    if any(keyword in text.lower() for keyword in health_keywords):
        return True
    return False

# --- API Endpoint ---

@app.post("/api/analyze")
async def analyze_file(file: UploadFile = File(...)):
    if file.content_type not in ["text/csv", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV or PDF.")

    violations = []
    filename = file.filename

    try:
        if file.content_type == "text/csv":
            df = pd.read_csv(file.file)
            for index, row in df.iterrows():
                for col in df.columns:
                    text = str(row[col])
                    if check_gdpr(text):
                        violations.append(f"GDPR Violation found in row {index + 1}, column '{col}' of {filename}")
                    if check_phi(text):
                        violations.append(f"PHI Violation found in row {index + 1}, column '{col}' of {filename}")

        elif file.content_type == "application/pdf":
            text = extract_text_from_pdf(file.file)
            # Simple check for now, can be improved
            if check_gdpr(text):
                violations.append(f"Potential GDPR Violation found in {filename}")
            if check_phi(text):
                violations.append(f"Potential PHI Violation found in {filename}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the file: {e}")

    return {"filename": filename, "violations": violations}

@app.post("/api/generate-report")
async def generate_report(violations: List[str]):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Set up the PDF
    width, height = letter
    c.drawString(72, height - 72, "Compliance Violation Report")
    c.setFont("Helvetica", 10)
    
    text = c.beginText(72, height - 108)
    text.setFont("Helvetica", 10)
    
    if not violations:
        text.textLine("No violations found.")
    else:
        for line in violations:
            # Simple line wrapping
            if len(line) > 100:
                text.textLine(line[:100])
                text.textLine(line[100:])
            else:
                text.textLine(line)
            text.moveCursor(0, 5) # Add a bit of space

    c.drawText(text)
    c.save()
    
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment;filename=violation_report.pdf"}
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to the GraniteRegulate Compliance Checker API"}
