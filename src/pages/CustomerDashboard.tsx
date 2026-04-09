import { issuedBooks, bookHistory, getDaysUntilDeadline, calculateFine } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">Here's your library overview</p>
      </motion.div>

      {/* Stats */}
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
                {issuedBooks.filter(b => getDaysUntilDeadline(b.returnDeadline) < 0).length}
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
              <p className="text-2xl font-bold font-display">{bookHistory.length}</p>
              <p className="text-xs text-muted-foreground">Books Returned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currently Issued */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Currently Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issuedBooks.map((ib) => {
              const days = getDaysUntilDeadline(ib.returnDeadline);
              const fine = calculateFine(ib.returnDeadline);
              const isOverdue = days < 0;
              const isNearDeadline = days >= 0 && days <= 3;

              return (
                <div key={ib.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary/50" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ib.book.title}</p>
                      <p className="text-xs text-muted-foreground">{ib.book.author} · ISBN: {ib.book.isbn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="text-xs text-muted-foreground">
                      <p>Issued: {ib.issueDate}</p>
                      <p>Due: {ib.returnDeadline}</p>
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

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Borrowing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bookHistory.map((ib) => (
              <div key={ib.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-sm">{ib.book.title}</p>
                  <p className="text-xs text-muted-foreground">{ib.book.author}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{ib.issueDate} → {ib.returnedDate}</p>
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
