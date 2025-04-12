import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or Word document.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const originalFilename = file.name;
    const fileExtension = getFileExtension(originalFilename);
    const uniqueFilename = `resume_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Write the file to the uploads directory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    try {
      // Run the Python script using the virtual environment
      const venvPython = path.join(process.cwd(), 'venv', 'bin', 'python3');
      const { stdout, stderr } = await execAsync(`"${venvPython}" resume_analyzer.py "${filePath}" "${file.type}"`);
      
      if (stderr) {
        console.error('Python script error:', stderr);
        return NextResponse.json(
          { error: 'Failed to analyze resume', details: stderr },
          { status: 500 }
        );
      }
      
      // Parse the JSON output from the Python script
      const result = JSON.parse(stdout);
      
      // Add the file path to the result
      result.filePath = filePath;
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('Error running Python script:', error);
      return NextResponse.json(
        { error: 'Failed to analyze resume', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { error: 'Failed to process resume', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const ext = path.extname(filename);
  return ext || (filename.includes('.') ? `.${filename.split('.').pop()}` : '');
} 