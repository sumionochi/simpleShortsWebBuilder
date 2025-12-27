import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const backgroundIndexStr = formData.get('backgroundIndex') as string;

    if (!file || !backgroundIndexStr) {
      return NextResponse.json({ error: 'Missing file or backgroundIndex' }, { status: 400 });
    }

    const backgroundIndex = parseInt(backgroundIndexStr);
    if (isNaN(backgroundIndex)) {
      return NextResponse.json({ error: 'Invalid background index' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileType = file.type.split('/')[0]; // Get the type (image or video)
    const extension = path.extname(file.name) || (fileType === 'video' ? '.mp4' : '.jpg'); // Default to .jpg for images

    const uploadDir = path.join(process.cwd(), 'public', 'backgrounds');
    await fs.mkdir(uploadDir, { recursive: true });

    // Delete any existing file with the same backgroundIndex but different extension
    const files = await fs.readdir(uploadDir);
    for (const existingFile of files) {
      if (existingFile.startsWith(`bg${backgroundIndex}`)) {
        await fs.unlink(path.join(uploadDir, existingFile));
      }
    }

    // Write the new file to the same location, effectively replacing it
    const newFilePath = path.join(uploadDir, `bg${backgroundIndex}${extension}`);
    await fs.writeFile(newFilePath, buffer);

    const fileUrl = `/backgrounds/bg${backgroundIndex}${extension}`;
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Error replacing background file:', error);
    return NextResponse.json({ error: 'Failed to replace background file' }, { status: 500 });
  }
}
