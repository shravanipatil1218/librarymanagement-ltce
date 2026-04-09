import { useState } from "react";
import { customers, issuedBooks, bookHistory } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, BookOpen, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { User } from "@/lib/mock-data";

export default function AdminDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage library operations</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{customers.length}</p>
              <p className="text-xs text-muted-foreground">Active Customers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{issuedBooks.length}</p>
              <p className="text-xs text-muted-foreground">Books Issued</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">2</p>
              <p className="text-xs text-muted-foreground">Pending Actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Customers with Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {customers.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedCustomer(c)}
              >
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email} · {c.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{c.branch}</Badge>
                  <Badge variant="default">{issuedBooks.filter(() => true).length} books</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(o) => !o && setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selectedCustomer.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selectedCustomer.phone}</div>
                <div><span className="text-muted-foreground">Branch:</span> {selectedCustomer.branch}</div>
              </div>
              <div>
                <h4 className="font-display font-semibold mb-2">Currently Issued</h4>
                {issuedBooks.map((ib) => (
                  <div key={ib.id} className="text-sm p-2 rounded bg-muted/50 mb-1">
                    {ib.book.title} · Due: {ib.returnDeadline}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-display font-semibold mb-2">History</h4>
                {bookHistory.slice(0, 3).map((ib) => (
                  <div key={ib.id} className="text-sm p-2 rounded border border-border mb-1">
                    {ib.book.title} · Returned: {ib.returnedDate}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
