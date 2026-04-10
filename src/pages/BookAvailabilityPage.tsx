import { useState, useEffect } from "react";
import { apiGetBookAvailability } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BookRow {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: string;
  available: number;
  total: number;
}

export default function BookAvailabilityPage() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetBookAvailability().then(setBooks).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(
    (b) => b.title.toLowerCase().includes(query.toLowerCase()) || b.isbn.includes(query)
  );

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Book Availability</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by title or ISBN..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="p-3">Title</th>
                <th className="p-3">ISBN</th>
                <th className="p-3">Genre</th>
                <th className="p-3 text-center">Available</th>
                <th className="p-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-sm font-medium">{b.title}</td>
                  <td className="p-3 text-xs text-muted-foreground">{b.isbn}</td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{b.genre}</Badge></td>
                  <td className="p-3 text-center"><Badge variant={b.available > 0 ? "default" : "destructive"}>{b.available}</Badge></td>
                  <td className="p-3 text-center text-sm">{b.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
