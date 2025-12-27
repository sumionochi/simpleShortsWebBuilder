import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { filename: fileUrl } = await request.json();

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    const parsedUrl = new URL(fileUrl, 'http://localhost'); // Replace with your domain if necessary
    const pathname = parsedUrl.pathname;
    const filename = path.basename(pathname);

    const uploadDir = path.join(process.cwd(), 'public', 'frames');
    const filePath = path.join(uploadDir, filename);

    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File does not exist' }, { status: 404 });
    }

    // Delete the file
    await fs.unlink(filePath);

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
