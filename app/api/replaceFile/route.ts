import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const frameIndexStr = formData.get('frameIndex') as string;

    if (!file || !frameIndexStr) {
      return NextResponse.json({ error: 'Missing file or frameIndex' }, { status: 400 });
    }

    const frameIndex = parseInt(frameIndexStr);
    if (isNaN(frameIndex)) {
      return NextResponse.json({ error: 'Invalid frame index' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = file.type.split('/')[0]; // Get the type (image or video)
    const extension = path.extname(file.name) || (fileType === 'video' ? '.mp4' : '.jpg'); // Default to .jpg for images

    const uploadDir = path.join(process.cwd(), 'public', 'frames');
    await fs.mkdir(uploadDir, { recursive: true });

    // Delete any existing file with the same frameIndex but different extension
    const files = await fs.readdir(uploadDir);
    for (const existingFile of files) {
      if (existingFile.startsWith(`index${frameIndex}`)) {
        await fs.unlink(path.join(uploadDir, existingFile));
      }
    }

    // Write the new file to the same location, effectively replacing it
    const newFilePath = path.join(uploadDir, `index${frameIndex}${extension}`);
    await fs.writeFile(newFilePath, buffer);

    const fileUrl = `/frames/index${frameIndex}${extension}`;
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Error replacing file:', error);
    return NextResponse.json({ error: 'Failed to replace file' }, { status: 500 });
  }
}
