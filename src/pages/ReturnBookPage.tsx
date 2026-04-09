import { useState } from "react";
import { issuedBooks } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ReturnBookPage() {
  const [selectedBook, setSelectedBook] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Return Request Submitted",
      description: "Admin will review your return request shortly.",
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Return a Book</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Return Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Book</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a book to return" />
                </SelectTrigger>
                <SelectContent>
                  {issuedBooks.map((ib) => (
                    <SelectItem key={ib.id} value={ib.id}>
                      {ib.book.title} — {ib.book.isbn}
                    </SelectItem>
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
            <Button type="submit" className="w-full" disabled={!selectedBook}>Submit Return Request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
