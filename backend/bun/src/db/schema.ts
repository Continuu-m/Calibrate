import { pgTable, serial, text, integer, timestamp, boolean, varchar, numeric } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  preferences: text('preferences').default('{}'),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  estimatedTime: numeric('estimated_time'), // in hours
  actualTime: numeric('actual_time'),
  taskType: varchar('task_type', { length: 50 }),
  priority: integer('priority').default(0),
});

// Subtasks table
export const subtasks = pgTable('subtasks', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  description: text('description').notNull(),
  estimatedTime: numeric('estimated_time'),
  order: integer('order').default(0),
  completed: boolean('completed').default(false),
});

// Predictions table
export const predictions = pgTable('predictions', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  predictedTime: numeric('predicted_time').notNull(),
  confidence: numeric('confidence').notNull(),
  modelVersion: varchar('model_version', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Actuals table
export const actuals = pgTable('actuals', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  actualTime: numeric('actual_time').notNull(),
  completionDate: timestamp('completion_date').defaultNow(),
  userNotes: text('user_notes'),
});

// UserPatterns table
export const userPatterns = pgTable('user_patterns', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  taskType: varchar('task_type', { length: 50 }),
  avgAccuracy: numeric('avg_accuracy'),
  systematicBias: numeric('systematic_bias'),
  calibrationFactor: numeric('calibration_factor'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
