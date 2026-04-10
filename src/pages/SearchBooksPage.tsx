import { useState, useEffect } from "react";
import { apiGetBooks } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/BookCard";
import { BookDetailDialog } from "@/components/BookDetailDialog";
import { Search } from "lucide-react";
import type { Book } from "@/lib/mock-data";

export default function SearchBooksPage() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetBooks(query ? { search: query } : undefined)
      .then((data) => {
        setBooks(data.map((b: any) => ({ ...b, coverUrl: b.cover_url || "" })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Search Books</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by title, author, or ISBN..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? (
        <p className="text-muted-foreground text-center py-12">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={setSelectedBook} />
            ))}
          </div>
          {books.length === 0 && <p className="text-muted-foreground text-center py-12">No books found matching "{query}"</p>}
        </>
      )}
      <BookDetailDialog book={selectedBook} open={!!selectedBook} onOpenChange={(o) => !o && setSelectedBook(null)} />
    </div>
  );
}
