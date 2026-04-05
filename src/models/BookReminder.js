import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    totalPages: { type: Number },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

bookSchema.index({ userId: 1 });
bookSchema.index({ name: 'text', author: 'text' });

export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dateTime: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    linkedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  },
  { timestamps: true }
);

reminderSchema.index({ userId: 1, dateTime: 1 });
reminderSchema.index({ userId: 1, isCompleted: 1 });

export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
