import { useState } from "react";
import { books } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/BookCard";
import { BookDetailDialog } from "@/components/BookDetailDialog";
import { Search } from "lucide-react";
import type { Book } from "@/lib/mock-data";

export default function SearchBooksPage() {
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase()) ||
      b.isbn.includes(query)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Search Books</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or ISBN..."
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((book) => (
          <BookCard key={book.id} book={book} onClick={setSelectedBook} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No books found matching "{query}"</p>
      )}
      <BookDetailDialog book={selectedBook} open={!!selectedBook} onOpenChange={(o) => !o && setSelectedBook(null)} />
    </div>
  );
}
