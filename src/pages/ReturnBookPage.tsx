import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetIssuedBooks, apiCreateNotification } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface IssuedBookRow {
  id: string;
  title: string;
  isbn: string;
}

export default function ReturnBookPage() {
  const { user } = useAuth();
  const [issuedBooks, setIssuedBooks] = useState<IssuedBookRow[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiGetIssuedBooks(user.id, "issued").catch(() => []),
      apiGetIssuedBooks(user.id, "overdue").catch(() => []),
    ]).then(([issued, overdue]) => {
      setIssuedBooks([...issued, ...overdue]);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const book = issuedBooks.find(b => b.id === selectedBook);
    try {
      await apiCreateNotification("return_request", `${user?.name} requested to return '${book?.title}'`, user?.id, undefined);
      toast({ title: "Return Request Submitted", description: "Admin will review your return request shortly." });
    } catch {
      toast({ title: "Error", description: "Failed to submit return request.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Return a Book</h1>
      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Return Request Form</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Book</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger><SelectValue placeholder="Choose a book to return" /></SelectTrigger>
                <SelectContent>
                  {issuedBooks.map((ib) => (
                    <SelectItem key={ib.id} value={ib.id}>{ib.title} — {ib.isbn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
              <Label>Condition Notes (optional)</Label>
              <Input placeholder="Any damage or notes about the book" />
            </div>
            <Button type="submit" className="w-full" disabled={!selectedBook || loading}>
              {loading ? "Submitting..." : "Submit Return Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
