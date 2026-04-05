import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Book } from '@/models/BookReminder';
import { withAuth } from '@/lib/api';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const GET = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const query = { userId: user.id };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    const books = await Book.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: { books } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch books.' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, context, user) => {
  try {
    await connectDB();
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const author = formData.get('author');
    const description = formData.get('description');

    if (!file || !name) {
      return NextResponse.json({ success: false, message: 'File and name are required.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const book = await Book.create({
      userId: user.id,
      name,
      author,
      description,
      fileUrl: `/uploads/books/${filename}`,
      fileSize: buffer.length,
    });

    return NextResponse.json({ success: true, data: { book } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to upload book.' }, { status: 500 });
  }
});
