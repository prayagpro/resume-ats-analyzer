import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(fileContent: Buffer, fileType: string): Promise<any> {
  try {
    // Extract text from the file based on its type
    let text = '';
    
    if (fileType === 'application/pdf') {
      const pdfDoc = await PDFDocument.load(fileContent);
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        text += await page.getText();
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileContent });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
    
    if (!text.trim()) {
      throw new Error('No text could be extracted from the file');
    }
    
    // Analyze the resume using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional resume analyzer. Analyze the following resume and provide detailed insights about the candidate's skills, experience, education, and potential job matches. Format the response as a JSON object with the following structure: { skills: string[], experience: { role: string, company: string, duration: string, highlights: string[] }[], education: { degree: string, institution: string, year: string }[], jobMatches: string[], summary: string }"
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return analysis;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
} 