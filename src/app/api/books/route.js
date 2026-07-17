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

    let books;

    if (search) {
      // Deep search: MongoDB $text covers title/author/tags/extractedText
      // in one go, ranked by relevance via textScore.
      books = await Book.find(
        { ...query, $text: { $search: search } },
        { score: { $meta: 'textScore' } },
      )
        .sort({ score: { $meta: 'textScore' } })
        .select('-extractedText'); // never ship the full extracted text to the list view

      // Fallback for partial/short queries $text won't match (e.g. a
      // 2-letter fragment) — regex across title/author + extracted text.
      if (books.length === 0) {
        books = await Book.find({
          ...query,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
          ],
        })
          .select('-extractedText')
          .sort({ createdAt: -1 });

        // Last resort: regex against the (large, unindexed-for-regex)
        // extractedText field — only runs when nothing else matched, to
        // keep this cheap in the common case.
        if (books.length === 0) {
          books = await Book.find({ ...query })
            .select('name author tags fileUrl fileSize createdAt extractedText')
            .lean();
          books = books
            .filter((b) => new RegExp(search, 'i').test(b.extractedText || ''))
            .map(({ extractedText, ...rest }) => rest);
        }
      }
    } else {
      books = await Book.find(query).select('-extractedText').sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: { books } });
  } catch (error) {
    console.error('[books] GET:', error);
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

    // ---- Deep OCR / text extraction (Feature 3) ----
    // Runs inline at upload time. For very large libraries you'd move this
    // to a background job, but pdf-parse is fast enough (seconds) for a
    // single-book upload to just await it here.
    let extractedText = '';
    let extractionStatus = 'unsupported';

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      try {
        // `pdf-parse` — npm install pdf-parse
        const pdfParse = (await import('pdf-parse')).default;
        const parsed = await pdfParse(buffer);
        extractedText = (parsed.text || '').trim();
        extractionStatus = 'done';
      } catch (extractErr) {
        console.error('[books] pdf-parse failed:', extractErr);
        extractionStatus = 'failed';
      }
    }

    const book = await Book.create({
      userId: user.id,
      name,
      author,
      description,
      fileUrl: `/uploads/books/${filename}`,
      fileSize: buffer.length,
      extractedText,
      extractionStatus,
    });

    // Don't echo the (possibly huge) extracted text back to the client.
    const responseBook = book.toObject();
    delete responseBook.extractedText;

    return NextResponse.json({ success: true, data: { book: responseBook } }, { status: 201 });
  } catch (error) {
    console.error('[books] POST:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload book.' }, { status: 500 });
  }
});
