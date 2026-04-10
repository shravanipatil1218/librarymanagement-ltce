import { useState, useEffect } from "react";
import { apiGetIssuedBooks } from "@/lib/api";
import { getDaysUntilDeadline, calculateFine } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface IssuedBookRow {
  id: string;
  user_id: string;
  book_id: string;
  issue_date: string;
  return_deadline: string;
  returned_date?: string;
  status: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  description: string;
  rating: number;
  cover_url: string;
  available: number;
  total: number;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [issuedBooks, setIssuedBooks] = useState<IssuedBookRow[]>([]);
  const [history, setHistory] = useState<IssuedBookRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiGetIssuedBooks(user.id, "issued").catch(() => []),
      apiGetIssuedBooks(user.id, "overdue").catch(() => []),
      apiGetIssuedBooks(user.id, "returned").catch(() => []),
    ]).then(([issued, overdue, returned]) => {
      setIssuedBooks([...issued, ...overdue]);
      setHistory(returned);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">Here's your library overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{issuedBooks.length}</p>
              <p className="text-xs text-muted-foreground">Currently Issued</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">
                {issuedBooks.filter(b => getDaysUntilDeadline(b.return_deadline) < 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{history.length}</p>
              <p className="text-xs text-muted-foreground">Books Returned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Currently Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issuedBooks.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No books currently issued.</p>}
            {issuedBooks.map((ib) => {
              const days = getDaysUntilDeadline(ib.return_deadline);
              const fine = calculateFine(ib.return_deadline);
              const isOverdue = days < 0;
              const isNearDeadline = days >= 0 && days <= 3;

              return (
                <div key={ib.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary/50" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ib.title}</p>
                      <p className="text-xs text-muted-foreground">{ib.author} · ISBN: {ib.isbn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="text-xs text-muted-foreground">
                      <p>Issued: {ib.issue_date}</p>
                      <p>Due: {ib.return_deadline}</p>
                    </div>
                    {isOverdue && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue · ₹{fine}
                      </Badge>
                    )}
                    {isNearDeadline && (
                      <Badge className="bg-warning text-warning-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {days}d left
                      </Badge>
                    )}
                    {!isOverdue && !isNearDeadline && (
                      <Badge variant="outline" className="text-success">{days}d left</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Borrowing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {history.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No borrowing history yet.</p>}
            {history.map((ib) => (
              <div key={ib.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-sm">{ib.title}</p>
                  <p className="text-xs text-muted-foreground">{ib.author}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{ib.issue_date} → {ib.returned_date}</p>
                  <Badge variant="outline" className="text-success mt-1">Returned</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
