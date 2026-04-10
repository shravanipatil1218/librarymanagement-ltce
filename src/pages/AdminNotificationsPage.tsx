import { useState, useEffect } from "react";
import { apiGetNotifications, apiUpdateNotification } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetNotifications().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    await apiUpdateNotification(id, true).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast({ title: action === "accept" ? "Accepted" : "Rejected", description: `Request has been ${action}ed.` });
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Notifications</h1>
      {notifications.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />No new notifications</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={n.type === "return_request" ? "default" : n.type === "payment" ? "outline" : "destructive"}>
                    {n.type.replace("_", " ")}
                  </Badge>
                  <div>
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {n.type === "return_request" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAction(n.id, "accept")}><Check className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(n.id, "reject")}><X className="w-4 h-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
