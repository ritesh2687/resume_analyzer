from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml_model import analyze_resume

import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), job_desc: str = Form(...)):

    # ✅ FIX 3 (PUT HERE)
    if not file:
        raise HTTPException(status_code=400, detail="File missing")

    if not job_desc:
        raise HTTPException(status_code=400, detail="Job description missing")

    file_bytes = await file.read()

    text = file_bytes.decode("utf-8", errors="ignore")

    result = analyze_resume(text, job_desc)

    return result