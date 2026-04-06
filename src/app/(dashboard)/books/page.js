"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { uploadFile, api } from "@/utils/api";
import { fileSizeLabel } from "@/utils/helpers";
import {
  EmptyState,
  PageLoader,
  ConfirmDialog,
  Modal,
  SearchInput,
  Spinner,
} from "@/components/ui";
import {
  BookOpen,
  Upload,
  Trash2,
  ExternalLink,
  FileText,
  Search,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingBook, setViewingBook] = useState(null);
  const [form, setForm] = useState({ name: "", author: "", description: "" });
  const [file, setFile] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await api.get(
        `/api/books${search ? `?search=${encodeURIComponent(search)}` : ""}`,
      );
      setBooks(data.data.books);
    } catch {
      toast.error("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchBooks, search]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) setFile(accepted[0]);
    },
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a PDF file.");
    if (!form.name) return toast.error("Book name is required.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", form.name);
      fd.append("author", form.author);
      fd.append("description", form.description);
      await uploadFile("/api/books", fd);
      toast.success("Book uploaded.");
      setShowUpload(false);
      setForm({ name: "", author: "", description: "" });
      setFile(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/books/${deleteTarget._id}`);
      toast.success("Book deleted.");
      setDeleteTarget(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Law Books</h1>
          <p className="page-subtitle">{books.length} books in your library</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="btn-primary shrink-0"
        >
          <Upload className="w-4 h-4" /> Upload Book
        </button>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by title or author..."
        className="max-w-md"
      />

      {books.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title={search ? "No books found" : "No books yet"}
            description={
              search
                ? "Try a different search."
                : "Upload PDF law books to build your library."
            }
            action={
              !search && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="btn-primary"
                >
                  <Upload className="w-4 h-4" /> Upload First Book
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book._id} className="card-hover p-4 flex flex-col gap-3">
              <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center border border-primary-100">
                <FileText className="w-12 h-12 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm leading-snug truncate">
                  {book.name}
                </h3>
                {book.author && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {book.author}
                  </p>
                )}
                {book.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {book.description}
                  </p>
                )}
                {book.fileSize && (
                  <p className="text-xs text-slate-400 mt-1">
                    {fileSizeLabel(book.fileSize)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingBook(book)}
                  className="btn-secondary flex-1 text-xs py-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => setDeleteTarget(book)}
                  className="btn-danger py-1.5 px-2.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => {
          setShowUpload(false);
          setFile(null);
        }}
        title="Upload PDF Book"
        size="sm"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary-400 bg-primary-50"
                : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">
                  Drop a PDF here or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Only PDF files accepted
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="label">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              placeholder="e.g. PPC 1860 Annotated"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Author / Publisher</label>
            <input
              className="input"
              placeholder="Author name"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Brief description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* PDF Viewer Modal */}
      {viewingBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between bg-surface-900 px-5 py-3 border-b border-white/10">
            <div>
              <h3 className="text-white font-semibold text-sm">
                {viewingBook.name}
              </h3>
              {viewingBook.author && (
                <p className="text-slate-400 text-xs">{viewingBook.author}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={viewingBook.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
              </a>
              <button
                onClick={() => setViewingBook(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${viewingBook.fileUrl}#toolbar=1`}
              className="w-full h-full border-0"
              title={viewingBook.name}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Delete "${deleteTarget?.name}"? The PDF file will also be removed.`}
        loading={deleting}
      />
    </div>
  );
}
