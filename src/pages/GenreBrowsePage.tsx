import { useState, useEffect } from "react";
import { apiGetBooks, apiGetGenres } from "@/lib/api";
import { BookCard } from "@/components/BookCard";
import { BookDetailDialog } from "@/components/BookDetailDialog";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/lib/mock-data";

export default function GenreBrowsePage() {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    apiGetBooks(selectedGenre ? { genre: selectedGenre } : undefined)
      .then((data) => {
        setBooks(data.map((b: any) => ({ ...b, coverUrl: b.cover_url || "" })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedGenre]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Browse by Genre</h1>
      <div className="flex flex-wrap gap-2">
        <Badge variant={selectedGenre === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedGenre(null)}>All</Badge>
        {genres.map((g) => (
          <Badge key={g} variant={selectedGenre === g ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedGenre(g)}>{g}</Badge>
        ))}
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
          {books.length === 0 && <p className="text-muted-foreground text-center py-12">No books in this genre yet.</p>}
        </>
      )}
      <BookDetailDialog book={selectedBook} open={!!selectedBook} onOpenChange={(o) => !o && setSelectedBook(null)} />
    </div>
  );
}
