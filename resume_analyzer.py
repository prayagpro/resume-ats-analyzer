import sys
import json
import re
import os
import tempfile
from typing import Dict, List, Any, Optional
import PyPDF2
import docx
import io

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}", file=sys.stderr)
        return ""
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting text from DOCX: {str(e)}", file=sys.stderr)
        return ""

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from a file based on its type."""
    if file_type == "application/pdf":
        return extract_text_from_pdf(file_path)
    elif file_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        return extract_text_from_docx(file_path)
    else:
        print(f"Unsupported file type: {file_type}", file=sys.stderr)
        return ""

def extract_name(text: str) -> str:
    """Extract name from resume text."""
    # Simple name extraction - first line or after "Name:" or "Resume"
    lines = text.split('\n')
    for i in range(min(5, len(lines))):
        line = lines[i].strip()
        if line and not line.lower().startswith(('resume', 'cv', 'name:')):
            return line
    return ""

def extract_email(text: str) -> str:
    """Extract email from resume text."""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    """Extract phone number from resume text."""
    phone_pattern = r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else ""

def extract_location(text: str) -> str:
    """Extract location from resume text."""
    location_indicators = ['address', 'location', 'based in', 'residing in']
    lines = text.split('\n')
    
    for line in lines:
        for indicator in location_indicators:
            if indicator in line.lower():
                return line.strip()
    
    return ""

def extract_work_experience(text: str) -> List[Dict[str, str]]:
    """Extract work experience from resume text."""
    experience_indicators = ['experience', 'employment', 'work history', 'professional experience']
    lines = text.split('\n')
    experiences = []
    in_experience_section = False
    current_experience = ""
    
    for line in lines:
        lower_line = line.lower()
        
        # Check if we're entering the experience section
        for indicator in experience_indicators:
            if indicator in lower_line:
                in_experience_section = True
                break
        
        # If we're in the experience section, collect lines
        if in_experience_section:
            if line.strip() and not any(x in lower_line for x in ['education', 'skills']):
                current_experience += line + " "
            else:
                if current_experience.strip():
                    experiences.append({"description": current_experience.strip()})
                    current_experience = ""
                
                # Check if we're leaving the experience section
                if any(x in lower_line for x in ['education', 'skills']):
                    in_experience_section = False
    
    # Add the last experience if there is one
    if current_experience.strip():
        experiences.append({"description": current_experience.strip()})
    
    return experiences

def extract_education(text: str) -> List[Dict[str, str]]:
    """Extract education from resume text."""
    education_indicators = ['education', 'academic', 'university', 'college', 'school']
    lines = text.split('\n')
    educations = []
    in_education_section = False
    current_education = ""
    
    for line in lines:
        lower_line = line.lower()
        
        # Check if we're entering the education section
        for indicator in education_indicators:
            if indicator in lower_line:
                in_education_section = True
                break
        
        # If we're in the education section, collect lines
        if in_education_section:
            if line.strip() and not any(x in lower_line for x in ['experience', 'skills']):
                current_education += line + " "
            else:
                if current_education.strip():
                    educations.append({"description": current_education.strip()})
                    current_education = ""
                
                # Check if we're leaving the education section
                if any(x in lower_line for x in ['experience', 'skills']):
                    in_education_section = False
    
    # Add the last education if there is one
    if current_education.strip():
        educations.append({"description": current_education.strip()})
    
    return educations

def extract_skills(text: str) -> List[str]:
    """Extract skills from resume text."""
    skill_indicators = ['skills', 'expertise', 'proficiencies', 'competencies']
    lines = text.split('\n')
    skills = []
    in_skills_section = False
    
    for line in lines:
        lower_line = line.lower()
        
        # Check if we're entering the skills section
        for indicator in skill_indicators:
            if indicator in lower_line:
                in_skills_section = True
                break
        
        # If we're in the skills section, collect skills
        if in_skills_section:
            if line.strip() and not any(x in lower_line for x in ['experience', 'education']):
                # Split by common delimiters
                skill_parts = re.split(r'[,•|]', line)
                for part in skill_parts:
                    skill = part.strip()
                    if skill and not any(indicator in skill.lower() for indicator in skill_indicators):
                        skills.append(skill)
            else:
                # Check if we're leaving the skills section
                if any(x in lower_line for x in ['experience', 'education']):
                    in_skills_section = False
    
    return skills

def extract_keywords(text: str) -> List[str]:
    """Extract keywords from resume text."""
    # Common resume keywords
    common_keywords = [
        'leadership', 'management', 'communication', 'teamwork', 'problem solving',
        'project management', 'strategic planning', 'analysis', 'research',
        'development', 'design', 'implementation', 'coordination', 'collaboration',
        'organization', 'planning', 'budgeting', 'forecasting', 'reporting',
        'presentation', 'negotiation', 'customer service', 'sales', 'marketing',
        'advertising', 'public relations', 'social media', 'content creation',
        'data analysis', 'data visualization', 'statistics', 'programming',
        'software development', 'web development', 'mobile development',
        'database', 'cloud', 'security', 'networking', 'infrastructure',
        'quality assurance', 'testing', 'deployment', 'maintenance', 'support',
        'training', 'mentoring', 'coaching', 'facilitation', 'public speaking',
        'writing', 'editing', 'proofreading', 'translation', 'interpretation',
        'event planning', 'logistics', 'procurement', 'vendor management',
        'contract negotiation', 'compliance', 'regulatory', 'legal', 'finance',
        'accounting', 'auditing', 'taxation', 'budgeting', 'forecasting',
        'reporting', 'analysis', 'modeling', 'valuation', 'investment',
        'portfolio management', 'risk management', 'insurance', 'banking',
        'lending', 'credit', 'collections'
    ]
    
    found_keywords = []
    lower_text = text.lower()
    
    for keyword in common_keywords:
        if keyword.lower() in lower_text:
            found_keywords.append(keyword)
    
    return found_keywords

def analyze_resume(text: str) -> Dict[str, Any]:
    """Analyze resume text and extract relevant information."""
    # Extract personal information
    personal_info = {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "location": extract_location(text)
    }
    
    # Extract work experience
    work_experience = extract_work_experience(text)
    
    # Extract education
    education = extract_education(text)
    
    # Extract skills
    skills = extract_skills(text)
    
    # Extract keywords
    keywords = extract_keywords(text)
    
    return {
        "personal_info": personal_info,
        "work_experience": work_experience,
        "education": education,
        "skills": skills,
        "keywords": keywords,
        "raw_text": text
    }

def calculate_ats_score(data: Dict[str, Any]) -> int:
    """Calculate ATS score based on resume analysis."""
    score = 0
    max_score = 100
    
    # Check for basic resume components
    if data["personal_info"]["name"]: score += 10
    if data["personal_info"]["email"]: score += 10
    if data["personal_info"]["phone"]: score += 10
    if data["personal_info"]["location"]: score += 10
    
    # Check for work experience
    if data["work_experience"] and len(data["work_experience"]) > 0:
        score += min(30, len(data["work_experience"]) * 10)
    
    # Check for education
    if data["education"] and len(data["education"]) > 0:
        score += min(20, len(data["education"]) * 10)
    
    # Check for skills
    if data["skills"] and len(data["skills"]) > 0:
        score += min(20, len(data["skills"]) * 2)
    
    # Check for keywords
    if data["keywords"] and len(data["keywords"]) > 0:
        score += min(10, len(data["keywords"]))
    
    return min(score, max_score)

def main():
    """Main function to process resume and return analysis results."""
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments. Usage: python resume_analyzer.py <file_path> <file_type>"}), file=sys.stderr)
        sys.exit(1)
    
    file_path = sys.argv[1]
    file_type = sys.argv[2]
    
    # Extract text from file
    text = extract_text_from_file(file_path, file_type)
    
    if not text:
        print(json.dumps({"error": "Failed to extract text from the file"}), file=sys.stderr)
        sys.exit(1)
    
    # Analyze resume
    analysis = analyze_resume(text)
    
    # Calculate ATS score
    score = calculate_ats_score(analysis)
    
    # Return results
    result = {
        "score": score,
        "details": analysis,
        "message": "Resume analyzed successfully"
    }
    
    print(json.dumps(result))
    sys.exit(0)

if __name__ == "__main__":
    main() 