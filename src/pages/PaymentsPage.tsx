import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGetIssuedBooks, apiCreatePayment } from "@/lib/api";
import { calculateFine, getDaysUntilDeadline } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface IssuedBookRow {
  id: string;
  return_deadline: string;
  title: string;
  author: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [overdueBooks, setOverdueBooks] = useState<IssuedBookRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiGetIssuedBooks(user.id, "overdue")
      .then(setOverdueBooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalFine = overdueBooks.reduce((sum, ib) => sum + calculateFine(ib.return_deadline), 0);

  const handlePay = async () => {
    if (!user) return;
    try {
      await apiCreatePayment(user.id, totalFine, "online", undefined, "Late fee payment");
      toast({ title: "Payment Recorded", description: `₹${totalFine} payment has been recorded.` });
    } catch {
      toast({ title: "Payment Failed", description: "Could not process payment.", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Payments & Fees</h1>
      {overdueBooks.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">No outstanding fees. You're all clear! 🎉</p></CardContent></Card>
      ) : (
        <>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center justify-between">
                <span>Outstanding Fees</span>
                <Badge variant="destructive" className="text-lg px-3 py-1">₹{totalFine}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueBooks.map((ib) => {
                  const fine = calculateFine(ib.return_deadline);
                  const daysOverdue = Math.abs(getDaysUntilDeadline(ib.return_deadline));
                  return (
                    <div key={ib.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm">{ib.title}</p>
                        <p className="text-xs text-muted-foreground">{daysOverdue} days overdue · ₹10/day</p>
                      </div>
                      <span className="font-bold text-destructive">₹{fine}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Button className="w-full" onClick={handlePay}>Pay ₹{totalFine} Online</Button>
        </>
      )}
    </div>
  );
}
