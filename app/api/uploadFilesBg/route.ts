import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const shouldClearBgsounds = formData.get('shouldClearBgsounds') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'backgrounds');
    await fs.mkdir(uploadDir, { recursive: true });

    if (shouldClearBgsounds) {
      // Clear all existing files in the 'backgrounds' directory if 'shouldClearBgsounds' is true
      const existingFiles = await fs.readdir(uploadDir);
      for (const existingFile of existingFiles) {
        const filePath = path.join(uploadDir, existingFile);
        await fs.unlink(filePath);
      }
    }

    // Read the existing files to determine the next available background index
    const files = await fs.readdir(uploadDir);
    let maxIndex = -1;

    // Find the maximum existing background index
    for (const existingFile of files) {
      const match = existingFile.match(/^bg(\d+)/);
      if (match) {
        const currentIndex = parseInt(match[1]);
        if (currentIndex > maxIndex) {
          maxIndex = currentIndex;
        }
      }
    }

    // Use the next available index
    const bgIndex = maxIndex + 1;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = file.type.split('/')[0]; // Get the type (image or video)
    const extension = path.extname(file.name) || (fileType === 'video' ? '.mp4' : '.jpg'); // Default to .jpg for images

    // Construct the filename using the next available bgIndex
    const newFilePath = path.join(uploadDir, `bg${bgIndex}${extension}`);

    // Write the file
    await fs.writeFile(newFilePath, buffer);

    const fileUrl = `/backgrounds/bg${bgIndex}${extension}`;
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Error uploading background file:', error);
    return NextResponse.json({ error: 'Failed to upload background file' }, { status: 500 });
  }
}
