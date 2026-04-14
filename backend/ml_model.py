from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 🧠 Simple skills database (you can expand later)
SKILLS_DB = [
    "python",
    "java",
    "machine learning",
    "sql",
    "react",
    "fastapi",
    "django",
    "flask",
    "nlp",
    "deep learning"
]

# 🔍 Extract skills from resume text
def extract_skills(text):
    text = text.lower()
    return [skill for skill in SKILLS_DB if skill in text]


# 📊 Calculate similarity score between resume & job description
def calculate_score(resume_text, job_desc):
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_desc])

    score = cosine_similarity(vectors[0], vectors[1])[0][0]
    return round(score * 100, 2)


# 🤖 MAIN AI FUNCTION
def analyze_resume(resume_text, job_desc):
    resume_text = resume_text.lower()
    job_desc = job_desc.lower()

    # Extract skills from resume
    skills = extract_skills(resume_text)

    # Match & missing skills
    matched = [s for s in SKILLS_DB if s in resume_text and s in job_desc]
    missing = [s for s in SKILLS_DB if s in job_desc and s not in skills]

    # Score calculation
    score = calculate_score(resume_text, job_desc)

    # ---------------- SMART AI FEEDBACK ----------------
    feedback = []

    if score < 40:
        feedback.append("❌ Your resume is weak for this role.")
        feedback.append("👉 Add more relevant skills from job description.")

    elif score < 70:
        feedback.append("⚠️ Medium match with job description.")
        feedback.append("👉 Improve missing skills to increase chances.")

    else:
        feedback.append("🚀 Strong match! You are a good fit for this role.")

    # Skill-based suggestions
    if missing:
        feedback.append("📌 Missing important skills:")
        feedback.append(", ".join(missing))

    if "project" not in resume_text:
        feedback.append("💡 Add 2–3 strong projects in your resume.")

    if "experience" not in resume_text:
        feedback.append("💡 Mention internships or real work experience.")

    if "github" not in resume_text:
        feedback.append("💡 Add GitHub profile to showcase your work.")

    return {
        "score": score,
        "skills": skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "feedback": feedback
    }