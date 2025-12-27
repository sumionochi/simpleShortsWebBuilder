// schema.ts
import { pgTable, uuid, text, varchar, jsonb,
  integer,
  boolean, } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // UUID as primary key
  full_name: text('full_name').notNull(), // Name as text
  email: text('email').notNull(), // Email with uniqueness constraint
  avatar_url: text('avatar_url'), // Avatar URL field
  subscription: boolean('subscription').default(false), // Subscription as boolean with default false
});

export const progressSaved = pgTable('progress_saved', {
  id: uuid('id').primaryKey().defaultRandom().notNull(), 
  profile_id: uuid('profile_id').references(() => profiles.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  generatedScript: text('generated_script'),
  selectedTopic: varchar('selected_topic', { length: 255 }),
  audioUrl: varchar('audio_url', { length: 255 }),
  captions: jsonb('captions'),
  newCaption: jsonb('new_caption'),
  seconds: integer('seconds'),
  words: integer('words'),
  prompt: text('prompt'),
  model: varchar('model', { length: 50 }),
  selectedVoice: varchar('selected_voice', { length: 50 }),
  groupedCaptions: jsonb('grouped_captions'),
  frames: jsonb('frames'),
  bgmTracks: jsonb('bgm_tracks'),
  backgroundsBg: jsonb('backgrounds_bg'),
  selectedWordsData: jsonb('selected_words_data'),
  frameTemplateMap: jsonb('frame_template_map'),
  frameStyles: jsonb('frame_styles'),
  textSegments: jsonb('text_segments'),
  newSegment: jsonb('new_segment'),
  paddingBetweenLines: integer('padding_between_lines'),
  paddingFromFrame: integer('padding_from_frame'),
  secondaryTextSegmentsSec: jsonb('secondary_text_segments_sec'),
  newSegmentSec: jsonb('new_segment_sec'),
  transitionVideoUrl: jsonb('transition_video_url'),
  transitionVolume: jsonb('transition_volume'),
  selectedTransitions: jsonb('selected_transitions'),
  backgroundColor: varchar('background_color', { length: 50 }),
});