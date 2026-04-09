import { issuedBooks, calculateFine, getDaysUntilDeadline } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const overdueBooks = issuedBooks.filter((ib) => getDaysUntilDeadline(ib.returnDeadline) < 0);
  const totalFine = overdueBooks.reduce((sum, ib) => sum + calculateFine(ib.returnDeadline), 0);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Payments & Fees</h1>

      {overdueBooks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No outstanding fees. You're all clear! 🎉</p>
          </CardContent>
        </Card>
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
                  const fine = calculateFine(ib.returnDeadline);
                  const daysOverdue = Math.abs(getDaysUntilDeadline(ib.returnDeadline));
                  return (
                    <div key={ib.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-sm">{ib.book.title}</p>
                        <p className="text-xs text-muted-foreground">{daysOverdue} days overdue · ₹10/day</p>
                      </div>
                      <span className="font-bold text-destructive">₹{fine}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Button
            className="w-full"
            onClick={() =>
              toast({ title: "Payment Gateway", description: "Stripe/Razorpay integration requires backend setup. Enable Lovable Cloud to proceed." })
            }
          >
            Pay ₹{totalFine} Online
          </Button>
        </>
      )}
    </div>
  );
}
