import { useState, useEffect } from "react";
import { apiGetCustomers, apiGetIssuedBooks } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, BookOpen, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
}

interface IssuedBookRow {
  id: string;
  issue_date: string;
  return_deadline: string;
  returned_date?: string;
  status: string;
  title: string;
}

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBooks, setCustomerBooks] = useState<IssuedBookRow[]>([]);
  const [customerHistory, setCustomerHistory] = useState<IssuedBookRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetCustomers().then(setCustomers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    Promise.all([
      apiGetIssuedBooks(selectedCustomer.id, "issued").catch(() => []),
      apiGetIssuedBooks(selectedCustomer.id, "returned").catch(() => []),
    ]).then(([issued, returned]) => {
      setCustomerBooks(issued);
      setCustomerHistory(returned);
    });
  }, [selectedCustomer]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage library operations</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold font-display">{customers.length}</p><p className="text-xs text-muted-foreground">Active Customers</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"><BookOpen className="w-5 h-5 text-secondary" /></div>
            <div><p className="text-2xl font-bold font-display">—</p><p className="text-xs text-muted-foreground">Books Issued</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
            <div><p className="text-2xl font-bold font-display">—</p><p className="text-xs text-muted-foreground">Pending Actions</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-lg">Customers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedCustomer(c)}>
                <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.email} · {c.phone}</p></div>
                <Badge variant="outline">{c.branch}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={(o) => !o && setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{selectedCustomer?.name}</DialogTitle></DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selectedCustomer.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedCustomer.phone}</div>
                <div><span className="text-muted-foreground">Branch:</span> {selectedCustomer.branch}</div>
              </div>
              <div>
                <h4 className="font-display font-semibold mb-2">Currently Issued</h4>
                {customerBooks.length === 0 && <p className="text-sm text-muted-foreground">No books currently issued.</p>}
                {customerBooks.map((ib) => (
                  <div key={ib.id} className="text-sm p-2 rounded bg-muted/50 mb-1">{ib.title} · Due: {ib.return_deadline}</div>
                ))}
              </div>
              <div>
                <h4 className="font-display font-semibold mb-2">History</h4>
                {customerHistory.length === 0 && <p className="text-sm text-muted-foreground">No history.</p>}
                {customerHistory.slice(0, 5).map((ib) => (
                  <div key={ib.id} className="text-sm p-2 rounded border border-border mb-1">{ib.title} · Returned: {ib.returned_date}</div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
