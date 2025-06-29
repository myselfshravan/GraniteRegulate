from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import fitz  # PyMuPDF
import os
from typing import List
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import tempfile

# --- Import WatsonX AI Functions ---
from watsonchat import analyze_text_for_violations
from speech import transcribe_audio
from asana_client import create_asana_task

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Adjust this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Function for PDF Extraction ---
def extract_text_from_pdf(file_stream):
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        full_text += page.get_text()
    return full_text

# --- Main Analysis API Endpoint ---
@app.post("/api/analyze")
async def analyze_file(file: UploadFile = File(...)):
    allowed_types = ["text/csv", "application/pdf", "audio/mpeg", "audio/wav", "audio/mp3"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Received {file.content_type}. Please upload a CSV, PDF, or audio file.")

    filename = file.filename
    text_to_analyze = ""

    try:
        # --- Text Extraction based on File Type ---
        if file.content_type == "text/csv":
            df = pd.read_csv(file.file)
            text_to_analyze = df.to_string()

        elif file.content_type == "application/pdf":
            text_to_analyze = extract_text_from_pdf(file.file)

        elif file.content_type in ["audio/mpeg", "audio/wav", "audio/mp3"]:
            # Save the uploaded audio to a temporary file to be processed by the speech-to-text SDK
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp_audio:
                tmp_audio.write(await file.read())
                tmp_audio_path = tmp_audio.name
            
            # Transcribe the audio file
            text_to_analyze = transcribe_audio(tmp_audio_path)
            
            # Clean up the temporary file
            os.unlink(tmp_audio_path)

        # --- Perform AI Analysis ---
        if not text_to_analyze.strip():
            return {"filename": filename, "violations": ["No content found to analyze."]}

        # Call the WatsonX AI model for analysis
        # The result from the model is a single string, which we can wrap in a list
        analysis_result = analyze_text_for_violations(text_to_analyze)
        violations = [line.strip() for line in analysis_result.split('\n') if line.strip()]

        # --- Create Asana Task if Violations are Found ---
        if violations:
            task_name = f"Compliance Violation Detected in {filename}"
            task_notes = "The following violations were detected:\n\n" + "\n".join(violations)
            create_asana_task(task_name, task_notes)


    except Exception as e:
        # Log the full error for debugging
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the file: {str(e)}")

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
