// /api/uploadBgMusic.ts

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[]; // Get all files
    const shouldClearBgsounds = formData.get('shouldClearBgsounds') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'bgsounds');
    await fs.mkdir(uploadDir, { recursive: true });

    if (shouldClearBgsounds) {
      // Clear all existing files in the 'bgsounds' directory if 'shouldClearBgsounds' is true
      const existingFiles = await fs.readdir(uploadDir);
      for (const existingFile of existingFiles) {
        const filePath = path.join(uploadDir, existingFile);
        await fs.unlink(filePath);
      }
    }

    const fileUrls = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, ''); // Sanitize file name
      const newFilePath = path.join(uploadDir, sanitizedFileName);

      // Check if file already exists
      try {
        await fs.access(newFilePath);
        // If the file exists, throw an error
        return NextResponse.json({ error: `Audio file ${sanitizedFileName} already exists` }, { status: 400 });
      } catch {
        // File does not exist, proceed with upload
      }

      // Write the file
      await fs.writeFile(newFilePath, buffer);

      const fileUrl = `/bgsounds/${sanitizedFileName}`;
      fileUrls.push(fileUrl);
    }

    return NextResponse.json({ fileUrls });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}
