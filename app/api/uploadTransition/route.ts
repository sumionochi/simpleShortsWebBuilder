import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Parse the form data from the request
    const formData = await request.formData();

    // Collect all keys that match 'transitionVideoX' where X is a number
    const transitionVideoKeys = Array.from(formData.keys()).filter(key => /^transitionVideo\d+$/.test(key));

    if (transitionVideoKeys.length === 0) {
      return NextResponse.json(
        { error: 'No transition videos provided' },
        { status: 400 }
      );
    }

    // Sort the keys numerically to ensure correct order
    transitionVideoKeys.sort((a, b) => {
      const indexA = parseInt(a.replace('transitionVideo', ''), 10);
      const indexB = parseInt(b.replace('transitionVideo', ''), 10);
      return indexA - indexB;
    });

    // Check if the keys start from 0
    const startsFromZero = transitionVideoKeys[0] === 'transitionVideo0';

    // Define the upload directory and ensure it exists
    const uploadDir = path.join(process.cwd(), 'public', 'transitions');
    await fs.mkdir(uploadDir, { recursive: true });

    // Clear the transitions folder if keys start from 0
    if (startsFromZero) {
      try {
        const files = await fs.readdir(uploadDir);
        for (const file of files) {
          const filePath = path.join(uploadDir, file);
          await fs.unlink(filePath);
        }
        console.log('Existing files in transitions folder have been removed.');
      } catch (error) {
        console.error('Error clearing transitions folder:', error);
      }
    }

    const uploadedFilenames: string[] = [];

    // Process each transition video in order
    for (const key of transitionVideoKeys) {
      const transitionVideo = formData.get(key) as File;

      if (transitionVideo) {
        // Read the file data
        const arrayBuffer = await transitionVideo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get the original filename and sanitize it
        let originalFilename = transitionVideo.name;
        originalFilename = path.basename(originalFilename).replace(/\s+/g, '_');

        // Create a unique filename
        const uniqueFilename = `${Date.now()}_${originalFilename}`;

        // Define the file path where the video will be saved
        const filePath = path.join(uploadDir, uniqueFilename);

        // Write the new file to the specified path
        await fs.writeFile(filePath, buffer);

        uploadedFilenames.push(uniqueFilename);
      }
    }

    // Return the filenames to the client
    return NextResponse.json({
      message: 'Transition videos uploaded successfully',
      filenames: uploadedFilenames,
    });
  } catch (error) {
    console.error('Error uploading transition videos:', error);
    return NextResponse.json(
      { error: 'Failed to upload transition videos' },
      { status: 500 }
    );
  }
}
