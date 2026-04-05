import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Book } from '@/models/BookReminder';
import { withAuth } from '@/lib/api';
import { unlink } from 'fs/promises';
import path from 'path';

export const DELETE = withAuth(async (request, { params }, user) => {
  try {
    await connectDB();
    const book = await Book.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found.' }, { status: 404 });
    }
    try {
      const filePath = path.join(process.cwd(), 'public', book.fileUrl);
      await unlink(filePath);
    } catch {}
    return NextResponse.json({ success: true, message: 'Book deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete book.' }, { status: 500 });
  }
});
