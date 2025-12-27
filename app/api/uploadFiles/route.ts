import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const shouldClearFrames = formData.get('shouldClearFrames') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'frames');
    await fs.mkdir(uploadDir, { recursive: true });

    if (shouldClearFrames) {
      // Clear all existing files in the 'frames' directory if 'shouldClearFrames' is true
      const existingFiles = await fs.readdir(uploadDir);
      for (const existingFile of existingFiles) {
        const filePath = path.join(uploadDir, existingFile);
        await fs.unlink(filePath);
      }
    }

    // Read the existing files to determine the next available frame index
    const files = await fs.readdir(uploadDir);
    let maxIndex = -1;

    // Find the maximum existing frame index
    for (const existingFile of files) {
      const match = existingFile.match(/^index(\d+)/);
      if (match) {
        const currentIndex = parseInt(match[1]);
        if (currentIndex > maxIndex) {
          maxIndex = currentIndex;
        }
      }
    }

    // Use the next available index
    const frameIndex = maxIndex + 1;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = file.type.split('/')[0]; // Get the type (image or video)
    const extension = path.extname(file.name) || (fileType === 'video' ? '.mp4' : '.jpg'); // Default to .jpg for images

    // Construct the filename using the next available frameIndex
    const newFilePath = path.join(uploadDir, `index${frameIndex}${extension}`);

    // Write the file
    await fs.writeFile(newFilePath, buffer);

    const fileUrl = `/frames/index${frameIndex}${extension}`;
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
