import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiIssueBook } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Book } from "@/lib/mock-data";

interface BookDetailDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailDialog({ book, open, onOpenChange }: BookDetailDialogProps) {
  const { user } = useAuth();
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [duration, setDuration] = useState("14");
  const [loading, setLoading] = useState(false);

  if (!book) return null;

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const issueDate = new Date().toISOString().split("T")[0];
    const returnDeadline = new Date(Date.now() + parseInt(duration) * 86400000).toISOString().split("T")[0];
    try {
      await apiIssueBook(user.id, book.id, issueDate, returnDeadline);
      toast({ title: "Book Issued!", description: `"${book.title}" issued for ${duration} days.` });
      setShowIssueForm(false);
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Could not issue book.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); setShowIssueForm(false); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{book.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">by {book.author}</DialogDescription>
        </DialogHeader>
        {!showIssueForm ? (
          <div className="space-y-4">
            <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary/30" />
            </div>
            <p className="text-sm text-foreground">{book.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{book.genre}</Badge>
              <Badge variant="outline">ISBN: {book.isbn}</Badge>
              <div className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 fill-secondary text-secondary" /><span>{book.rating}/5</span></div>
            </div>
            <div className="text-sm text-muted-foreground">{book.available} of {book.total} copies available</div>
            <Button className="w-full" disabled={book.available === 0} onClick={() => setShowIssueForm(true)}>
              {book.available > 0 ? "Issue This Book" : "Not Available"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleIssue} className="space-y-4">
            <div className="space-y-2"><Label>Issue Date</Label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} readOnly /></div>
            <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" min="7" max="30" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
            <div className="space-y-2"><Label>Return Deadline</Label><Input type="date" value={new Date(Date.now() + parseInt(duration) * 86400000).toISOString().split("T")[0]} readOnly /></div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowIssueForm(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Issuing..." : "Confirm Issue"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
