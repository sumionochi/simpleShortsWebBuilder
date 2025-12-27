// app/api/generate-script/route.ts
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key")
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { prompt, selectedGenre, seconds, words, modelGPT } = await request.json()

    // Prepare the promptTopic
    const promptTopic = `
      You are a seasoned content writer for a YouTube Shorts channel, specializing in ${selectedGenre}.
      Your shorts are concise, make very very sure each strictly lasting ${seconds} seconds (strictly ${words} words). Your goal is to engage, inform, and entertain viewers with quirky, lesser-known facts about the topic. The tone should be light, humorous, and conversational.

      Structure the script as follows:
      1. **Hook**: Start with an intriguing or surprising fact to grab attention.
      2. **Connecting Facts**: Follow with related, funny, or surprising facts that naturally flow from the first, maintaining viewer interest.
      3. **Punchline**: End with a witty or humorous conclusion that leaves the viewer thinking or smiling.

      Example:
      {
        "selectedGenre": "Political Oddities",
        "prompt": "Indian Politics",
        "script": "Did you know that the Indian government once considered appointing a 'Minister of Happiness'? In 2014, the state of Madhya Pradesh actually created this bizarre position to improve citizens' well-being. Imagine having a job where your only task is to make people smile! Speaking of oddities, did you know that during the 1975 Emergency, the government tried to control the press so tightly that they even printed a fake newspaper? Talk about a 'reality check'! And here's a kicker: the Indian Parliament has a rule that allows a member to be expelled for just being late! So, if you're ever in a meeting, remember: punctuality is next to godliness! If only life had an alarm clock like that!"
      }

      Please return the script in strict JSON format with the following structure:
      {
        "selectedGenre": "${selectedGenre}",
        "prompt": "${prompt}",
        "script": "Here goes the generated script."
      }
    `


    const response = await openai.chat.completions.create({
      model: `${modelGPT}`,
      messages: [
        { role: 'system', content: promptTopic },
        { role: 'user', content: prompt }
      ]
    })

    const content = response.choices[0].message?.content || ''

    // Ensure the response is in proper JSON format
    const scriptData = JSON.parse(content)

    return NextResponse.json(scriptData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 })
  }
}
