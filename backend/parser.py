import pdfplumber
import docx
import io

def extract_text(filename, file_bytes):
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return " ".join([page.extract_text() or "" for page in pdf.pages])

    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        return " ".join([p.text for p in doc.paragraphs])

    return ""