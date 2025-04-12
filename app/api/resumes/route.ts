import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Read all files in the uploads directory
    const files = await fs.readdir(uploadsDir);
    
    // Get file stats and filter out directories
    const resumes = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        
        // Skip if it's a directory
        if (stats.isDirectory()) return null;
        
        // Get file extension and determine type
        const ext = path.extname(filename).toLowerCase();
        let type = 'application/octet-stream';
        if (ext === '.pdf') type = 'application/pdf';
        else if (ext === '.docx') type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        return {
          id: filename,
          name: filename,
          type,
          uploadedAt: stats.mtime.toISOString(),
        };
      })
    );

    // Filter out null values and sort by upload date (newest first)
    const validResumes = resumes
      .filter((resume): resume is NonNullable<typeof resume> => resume !== null)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(validResumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
} 