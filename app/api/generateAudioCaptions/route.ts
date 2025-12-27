import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import OpenAI from "openai";
import { Transcription } from 'openai/resources/audio/transcriptions';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { script, voice } = await request.json();

    const outputFilename = path.resolve('./public/sounds/speech.mp3');
    
    if (fs.existsSync(outputFilename)) {
      await fs.promises.unlink(outputFilename);
    }
    
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      input: script,
      voice: voice,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(outputFilename, buffer);

    // After generating the audio, we transcribe it using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputFilename),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"]
    }) as Transcription & { words?: Array<{ word: string, start: number, end: number }> };

    return NextResponse.json({
      message: 'Audio and captions generated successfully',
      url: `/sounds/speech.mp3`,
      captions: transcription.words,  
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate audio and captions' }, { status: 500 });
  }
}

