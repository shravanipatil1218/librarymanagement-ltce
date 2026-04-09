import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ManualReturnPage() {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Return Processed",
      description: "Book return has been recorded and receipt generated.",
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Manual Book Return</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Process Return</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name / ID</Label>
              <Input placeholder="Enter customer name or ID" required />
            </div>
            <div className="space-y-2">
              <Label>Book Title</Label>
              <Input placeholder="Enter book title" required />
            </div>
            <div className="space-y-2">
              <Label>ISBN</Label>
              <Input placeholder="978-X-XX-XXXXXX-X" required />
            </div>
            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-2">
              <Label>Late Fee (₹)</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Process Return</Button>
              <Button type="button" variant="outline" className="flex-1"
                onClick={() => toast({ title: "Receipt", description: "Receipt PDF generation requires backend setup." })}
              >
                Generate Receipt
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
