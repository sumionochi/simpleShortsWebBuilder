import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface Caption {
  start: number;
  end: number;
  word: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function saveFileToPublicFolder(request: Request): Promise<string> {
  const uploadDir = path.resolve('./public/sounds');
  const filePath = path.join(uploadDir, 'speech.mp3');

  // Check if the file exists and delete it if it does
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Deletes the old file
  }

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileStream = fs.createWriteStream(filePath);
  const readableStream = request.body;

  if (readableStream) {
    const reader = readableStream.getReader();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        fileStream.write(Buffer.from(value));
      }
      done = readerDone;
    }
  }

  fileStream.end();
  return filePath;
}

const MIN_WORD_DURATION = 0.05; // Minimum duration for each word to appear (in seconds)
const GAP_BETWEEN_WORDS = 0.05; // Delay between the end of one word and the start of the next (in seconds)

const fixZeroDurationWords = (captions: Caption[]): Caption[] => {
  const fixedCaptions = [...captions]; // Copy the array to avoid mutation

  for (let i = 0; i < fixedCaptions.length; i++) {
    const currentWord = fixedCaptions[i];

    // Handle zero-duration words
    if (currentWord.start === currentWord.end) {
      if (i + 1 < fixedCaptions.length) {
        const nextWord = fixedCaptions[i + 1];
        const timeDifference = nextWord.start - currentWord.start;

        // Set the end time of the current word to at least 1/4 of the time difference
        currentWord.end = currentWord.start + Math.max(MIN_WORD_DURATION, timeDifference / 4);

        // Ensure the next word's start time is greater than the current word's end time plus a gap
        nextWord.start = Math.max(nextWord.start, currentWord.end + GAP_BETWEEN_WORDS);

      } else {
        // For the last word, ensure it has at least the minimum duration
        currentWord.end = currentWord.start + MIN_WORD_DURATION;
      }
    }

    // Ensure the current word has a minimum duration
    if (currentWord.end - currentWord.start < MIN_WORD_DURATION) {
      currentWord.end = currentWord.start + MIN_WORD_DURATION;
    }

    // Handle cases where the current word ends after or too close to the next word's start
    if (i + 1 < fixedCaptions.length) {
      const nextWord = fixedCaptions[i + 1];

      if (currentWord.end + GAP_BETWEEN_WORDS > nextWord.start) {
        // Adjust next word's start time to allow a gap between words
        nextWord.start = currentWord.end + GAP_BETWEEN_WORDS;
      }
    }
  }

  return fixedCaptions;
};

export async function POST(request: Request) {
  try {
    const filePath = await saveFileToPublicFolder(request);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    // Static captions for testing (replace this with actual transcription if using OpenAI)
    // const staticCaptions = [
    //     {
    //         "word": "Did",
    //         "start": 0,
    //         "end": 0.2199999988079071
    //     },
    //     {
    //         "word": "you",
    //         "start": 0.2199999988079071,
    //         "end": 0.41999998688697815
    //     },
    //     {
    //         "word": "know",
    //         "start": 0.41999998688697815,
    //         "end": 0.5799999833106995
    //     },
    //     {
    //         "word": "that",
    //         "start": 0.5799999833106995,
    //         "end": 0.7799999713897705
    //     },
    //     {
    //         "word": "the",
    //         "start": 0.7799999713897705,
    //         "end": 0.8999999761581421
    //     },
    //     {
    //         "word": "hugely",
    //         "start": 0.8999999761581421,
    //         "end": 1.3600000143051147
    //     },
    //     {
    //         "word": "popular",
    //         "start": 1.3600000143051147,
    //         "end": 1.7999999523162842
    //     },
    //     {
    //         "word": "game",
    //         "start": 1.7999999523162842,
    //         "end": 2.200000047683716
    //     },
    //     {
    //         "word": "Call",
    //         "start": 2.4800000190734863,
    //         "end": 2.5199999809265137
    //     },
    //     {
    //         "word": "of",
    //         "start": 2.5199999809265137,
    //         "end": 2.740000009536743
    //     },
    //     {
    //         "word": "Duty",
    //         "start": 2.740000009536743,
    //         "end": 2.9200000762939453
    //     },
    //     {
    //         "word": "hid",
    //         "start": 3,
    //         "end": 3.5
    //     },
    //     {
    //         "word": "a",
    //         "start": 3.5,
    //         "end": 3.799999952316284
    //     },
    //     {
    //         "word": "bone",
    //         "start": 3.799999952316284,
    //         "end": 4.099999904632568
    //     },
    //     {
    //         "word": "chilling",
    //         "start": 4.099999904632568,
    //         "end": 4.340000152587891
    //     },
    //     {
    //         "word": "Easter",
    //         "start": 4.340000152587891,
    //         "end": 4.840000152587891
    //     },
    //     {
    //         "word": "egg",
    //         "start": 4.840000152587891,
    //         "end": 5.079999923706055
    //     },
    //     {
    //         "word": "in",
    //         "start": 5.079999923706055,
    //         "end": 5.239999771118164
    //     },
    //     {
    //         "word": "one",
    //         "start": 5.239999771118164,
    //         "end": 5.360000133514404
    //     },
    //     {
    //         "word": "of",
    //         "start": 5.360000133514404,
    //         "end": 5.460000038146973
    //     },
    //     {
    //         "word": "its",
    //         "start": 5.460000038146973,
    //         "end": 5.659999847412109
    //     },
    //     {
    //         "word": "maps",
    //         "start": 5.659999847412109,
    //         "end": 5.980000019073486
    //     },
    //     {
    //         "word": "The",
    //         "start": 7.079999923706055,
    //         "end": 7.380000114440918
    //     },
    //     {
    //         "word": "Asylum",
    //         "start": 7.380000114440918,
    //         "end": 7.71999979019165
    //     },
    //     {
    //         "word": "level",
    //         "start": 7.71999979019165,
    //         "end": 8.079999923706055
    //     },
    //     {
    //         "word": "contains",
    //         "start": 8.079999923706055,
    //         "end": 8.479999542236328
    //     },
    //     {
    //         "word": "a",
    //         "start": 8.479999542236328,
    //         "end": 8.699999809265137
    //     },
    //     {
    //         "word": "super",
    //         "start": 8.699999809265137,
    //         "end": 9.0600004196167
    //     },
    //     {
    //         "word": "spooky",
    //         "start": 9.0600004196167,
    //         "end": 9.319999694824219
    //     },
    //     {
    //         "word": "ghost",
    //         "start": 9.319999694824219,
    //         "end": 9.760000228881836
    //     },
    //     {
    //         "word": "whisper",
    //         "start": 9.760000228881836,
    //         "end": 10.079999923706055
    //     },
    //     {
    //         "word": "that",
    //         "start": 10.199999809265137,
    //         "end": 10.800000190734863
    //     },
    //     {
    //         "word": "occurs",
    //         "start": 10.800000190734863,
    //         "end": 10.800000190734863
    //     },
    //     {
    //         "word": "whenever",
    //         "start": 10.800000190734863,
    //         "end": 11.079999923706055
    //     },
    //     {
    //         "word": "a",
    //         "start": 11.079999923706055,
    //         "end": 11.5600004196167
    //     },
    //     {
    //         "word": "player",
    //         "start": 11.5600004196167,
    //         "end": 11.5600004196167
    //     },
    //     {
    //         "word": "approaches",
    //         "start": 11.5600004196167,
    //         "end": 11.960000038146973
    //     },
    //     {
    //         "word": "the",
    //         "start": 11.960000038146973,
    //         "end": 12.819999694824219
    //     },
    //     {
    //         "word": "bathrooms",
    //         "start": 12.819999694824219,
    //         "end": 12.819999694824219
    //     },
    //     {
    //         "word": "Imagine",
    //         "start": 13.680000305175781,
    //         "end": 13.800000190734863
    //     },
    //     {
    //         "word": "slipping",
    //         "start": 13.800000190734863,
    //         "end": 14.140000343322754
    //     },
    //     {
    //         "word": "in",
    //         "start": 14.140000343322754,
    //         "end": 14.520000457763672
    //     },
    //     {
    //         "word": "for",
    //         "start": 14.520000457763672,
    //         "end": 14.640000343322754
    //     },
    //     {
    //         "word": "a",
    //         "start": 14.640000343322754,
    //         "end": 14.779999732971191
    //     },
    //     {
    //         "word": "quick",
    //         "start": 14.779999732971191,
    //         "end": 15.039999961853027
    //     },
    //     {
    //         "word": "health",
    //         "start": 15.039999961853027,
    //         "end": 15.300000190734863
    //     },
    //     {
    //         "word": "pack",
    //         "start": 15.300000190734863,
    //         "end": 15.600000381469727
    //     },
    //     {
    //         "word": "and",
    //         "start": 15.600000381469727,
    //         "end": 15.9399995803833
    //     },
    //     {
    //         "word": "accidentally",
    //         "start": 15.9399995803833,
    //         "end": 16.31999969482422
    //     },
    //     {
    //         "word": "finding",
    //         "start": 16.31999969482422,
    //         "end": 16.760000228881836
    //     },
    //     {
    //         "word": "Casper's",
    //         "start": 16.760000228881836,
    //         "end": 17.68000030517578
    //     },
    //     {
    //         "word": "creepy",
    //         "start": 17.68000030517578,
    //         "end": 17.68000030517578
    //     },
    //     {
    //         "word": "cousin",
    //         "start": 17.68000030517578,
    //         "end": 18.059999465942383
    //     },
    //     {
    //         "word": "Making",
    //         "start": 19,
    //         "end": 19.079999923706055
    //     },
    //     {
    //         "word": "things",
    //         "start": 19.079999923706055,
    //         "end": 19.360000610351562
    //     },
    //     {
    //         "word": "more",
    //         "start": 19.360000610351562,
    //         "end": 19.81999969482422
    //     },
    //     {
    //         "word": "horrifying",
    //         "start": 19.81999969482422,
    //         "end": 20.239999771118164
    //     },
    //     {
    //         "word": "Halo",
    //         "start": 20.84000015258789,
    //         "end": 21
    //     },
    //     {
    //         "word": "Combat",
    //         "start": 21,
    //         "end": 21.459999084472656
    //     },
    //     {
    //         "word": "Evolved",
    //         "start": 21.459999084472656,
    //         "end": 21.84000015258789
    //     },
    //     {
    //         "word": "has",
    //         "start": 21.84000015258789,
    //         "end": 22.31999969482422
    //     },
    //     {
    //         "word": "a",
    //         "start": 22.31999969482422,
    //         "end": 22.579999923706055
    //     },
    //     {
    //         "word": "hidden",
    //         "start": 22.579999923706055,
    //         "end": 22.81999969482422
    //     },
    //     {
    //         "word": "message",
    //         "start": 22.81999969482422,
    //         "end": 23.299999237060547
    //     },
    //     {
    //         "word": "called",
    //         "start": 23.299999237060547,
    //         "end": 23.979999542236328
    //     },
    //     {
    //         "word": "the",
    //         "start": 23.979999542236328,
    //         "end": 24.200000762939453
    //     },
    //     {
    //         "word": "Siege",
    //         "start": 24.200000762939453,
    //         "end": 24.440000534057617
    //     },
    //     {
    //         "word": "of",
    //         "start": 24.440000534057617,
    //         "end": 24.65999984741211
    //     },
    //     {
    //         "word": "Madrigal",
    //         "start": 24.65999984741211,
    //         "end": 25.139999389648438
    //     },
    //     {
    //         "word": "playing",
    //         "start": 25.139999389648438,
    //         "end": 25.700000762939453
    //     },
    //     {
    //         "word": "in",
    //         "start": 25.700000762939453,
    //         "end": 25.81999969482422
    //     },
    //     {
    //         "word": "a",
    //         "start": 25.81999969482422,
    //         "end": 26.040000915527344
    //     },
    //     {
    //         "word": "secret",
    //         "start": 26.040000915527344,
    //         "end": 26.260000228881836
    //     },
    //     {
    //         "word": "location",
    //         "start": 26.260000228881836,
    //         "end": 26.8799991607666
    //     },
    //     {
    //         "word": "adding",
    //         "start": 27.399999618530273,
    //         "end": 27.739999771118164
    //     },
    //     {
    //         "word": "an",
    //         "start": 27.739999771118164,
    //         "end": 28.200000762939453
    //     },
    //     {
    //         "word": "eerie",
    //         "start": 28.200000762939453,
    //         "end": 28.200000762939453
    //     },
    //     {
    //         "word": "soundtrack",
    //         "start": 28.200000762939453,
    //         "end": 28.6200008392334
    //     },
    //     {
    //         "word": "to",
    //         "start": 28.6200008392334,
    //         "end": 29
    //     },
    //     {
    //         "word": "your",
    //         "start": 29,
    //         "end": 29.34000015258789
    //     },
    //     {
    //         "word": "exploration",
    //         "start": 29.34000015258789,
    //         "end": 29.81999969482422
    //     },
    //     {
    //         "word": "But",
    //         "start": 30.420000076293945,
    //         "end": 30.540000915527344
    //     },
    //     {
    //         "word": "here's",
    //         "start": 30.540000915527344,
    //         "end": 30.780000686645508
    //     },
    //     {
    //         "word": "the",
    //         "start": 30.780000686645508,
    //         "end": 30.959999084472656
    //     },
    //     {
    //         "word": "true",
    //         "start": 30.959999084472656,
    //         "end": 31.260000228881836
    //     },
    //     {
    //         "word": "nightmare",
    //         "start": 31.260000228881836,
    //         "end": 31.65999984741211
    //     },
    //     {
    //         "word": "Ever",
    //         "start": 32.2400016784668,
    //         "end": 32.34000015258789
    //     },
    //     {
    //         "word": "noticed",
    //         "start": 32.34000015258789,
    //         "end": 32.65999984741211
    //     },
    //     {
    //         "word": "Witcher",
    //         "start": 32.65999984741211,
    //         "end": 33.02000045776367
    //     },
    //     {
    //         "word": "3's",
    //         "start": 33.02000045776367,
    //         "end": 33.63999938964844
    //     },
    //     {
    //         "word": "gambling",
    //         "start": 33.63999938964844,
    //         "end": 34.02000045776367
    //     },
    //     {
    //         "word": "ghost",
    //         "start": 34.02000045776367,
    //         "end": 34.459999084472656
    //     },
    //     {
    //         "word": "In",
    //         "start": 35.060001373291016,
    //         "end": 35.15999984741211
    //     },
    //     {
    //         "word": "a",
    //         "start": 35.15999984741211,
    //         "end": 35.380001068115234
    //     },
    //     {
    //         "word": "deserted",
    //         "start": 35.380001068115234,
    //         "end": 35.63999938964844
    //     },
    //     {
    //         "word": "house",
    //         "start": 35.63999938964844,
    //         "end": 36.099998474121094
    //     },
    //     {
    //         "word": "you",
    //         "start": 36.41999816894531,
    //         "end": 36.47999954223633
    //     },
    //     {
    //         "word": "can",
    //         "start": 36.47999954223633,
    //         "end": 36.7599983215332
    //     },
    //     {
    //         "word": "find",
    //         "start": 36.7599983215332,
    //         "end": 36.97999954223633
    //     },
    //     {
    //         "word": "an",
    //         "start": 36.97999954223633,
    //         "end": 37.2400016784668
    //     },
    //     {
    //         "word": "apparition",
    //         "start": 37.2400016784668,
    //         "end": 37.63999938964844
    //     },
    //     {
    //         "word": "who",
    //         "start": 37.63999938964844,
    //         "end": 37.86000061035156
    //     },
    //     {
    //         "word": "just",
    //         "start": 37.86000061035156,
    //         "end": 38.279998779296875
    //     },
    //     {
    //         "word": "wants",
    //         "start": 38.279998779296875,
    //         "end": 38.29999923706055
    //     },
    //     {
    //         "word": "to",
    //         "start": 38.29999923706055,
    //         "end": 38.599998474121094
    //     },
    //     {
    //         "word": "play",
    //         "start": 38.599998474121094,
    //         "end": 38.7599983215332
    //     },
    //     {
    //         "word": "Gwent",
    //         "start": 38.7599983215332,
    //         "end": 39.099998474121094
    //     },
    //     {
    //         "word": "a",
    //         "start": 39.63999938964844,
    //         "end": 40.31999969482422
    //     },
    //     {
    //         "word": "hauntingly",
    //         "start": 40.31999969482422,
    //         "end": 41
    //     },
    //     {
    //         "word": "persistent",
    //         "start": 41,
    //         "end": 41
    //     },
    //     {
    //         "word": "ghost",
    //         "start": 41,
    //         "end": 41.400001525878906
    //     },
    //     {
    //         "word": "who",
    //         "start": 41.400001525878906,
    //         "end": 41.79999923706055
    //     },
    //     {
    //         "word": "reinforces",
    //         "start": 41.79999923706055,
    //         "end": 42.31999969482422
    //     },
    //     {
    //         "word": "the",
    //         "start": 42.31999969482422,
    //         "end": 42.880001068115234
    //     },
    //     {
    //         "word": "fear",
    //         "start": 42.880001068115234,
    //         "end": 42.900001525878906
    //     },
    //     {
    //         "word": "of",
    //         "start": 42.900001525878906,
    //         "end": 43.31999969482422
    //     },
    //     {
    //         "word": "unending",
    //         "start": 43.31999969482422,
    //         "end": 43.599998474121094
    //     },
    //     {
    //         "word": "monotonous",
    //         "start": 43.599998474121094,
    //         "end": 44.220001220703125
    //     },
    //     {
    //         "word": "tasks",
    //         "start": 44.220001220703125,
    //         "end": 44.7599983215332
    //     },
    //     {
    //         "word": "like",
    //         "start": 45.2400016784668,
    //         "end": 45.560001373291016
    //     },
    //     {
    //         "word": "folding",
    //         "start": 45.560001373291016,
    //         "end": 45.86000061035156
    //     },
    //     {
    //         "word": "laundry",
    //         "start": 45.86000061035156,
    //         "end": 46.29999923706055
    //     },
    //     {
    //         "word": "on",
    //         "start": 46.29999923706055,
    //         "end": 46.560001373291016
    //     },
    //     {
    //         "word": "a",
    //         "start": 46.560001373291016,
    //         "end": 46.939998626708984
    //     },
    //     {
    //         "word": "Sunday",
    //         "start": 46.939998626708984,
    //         "end": 46.959999084472656
    //     },
    //     {
    //         "word": "night",
    //         "start": 46.959999084472656,
    //         "end": 47.29999923706055
    //     }
    // ]

    const wordCaptions = transcription.words!.map((segment: any) => ({
        start: segment.start,
        end: segment.end,
        word: segment.word,
    }));

    const fixedCaptions = fixZeroDurationWords(wordCaptions);

    return NextResponse.json({
      message: 'Audio transcription successful',
      url: `/sounds/speech.mp3`,
      transcription: "transcription.text", 
      captions: fixedCaptions, 
    });
  } catch (error) {
    console.error('Error processing the audio:', error);
    return NextResponse.json({ error: 'Failed to process the audio' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Ensures the body can be streamed for large files
  },
};


