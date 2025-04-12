import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { analyzeResume } from '@/lib/analyzer';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, id);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Read file content
    const fileBuffer = await fs.readFile(filePath);
    
    // Analyze the resume
    const analysis = await analyzeResume(fileBuffer, id);

    // Save analysis to a JSON file
    const analysisPath = path.join(uploadsDir, `${id}.analysis.json`);
    await fs.writeFile(analysisPath, JSON.stringify(analysis, null, 2));

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error reanalyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to reanalyze resume' },
      { status: 500 }
    );
  }
} 