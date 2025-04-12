# Resume ATS Analyzer

A modern web application that analyzes resumes for ATS (Applicant Tracking System) compatibility and provides detailed insights to help job seekers improve their resumes.

## Features

- 📄 Upload PDF and Word documents
- 🔍 Instant ATS compatibility analysis
- 📊 Detailed scoring system
- 💡 Actionable improvement suggestions
- 🎨 Modern, responsive UI
- 🚀 Built with Next.js and Python

## Tech Stack

- **Frontend:**
  - Next.js 14
  - React
  - Tailwind CSS
  - TypeScript

- **Backend:**
  - Python
  - PyPDF2
  - python-docx

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resume-ats-analyzer.git
   cd resume-ats-analyzer
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. Upload your resume (PDF or Word document)
2. The system analyzes your resume for:
   - Personal information completeness
   - Work experience
   - Education
   - Skills
   - Keyword optimization
3. Receive a detailed ATS compatibility score and suggestions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ using Next.js and Python
- Inspired by the need for better resume optimization tools 