import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateReceiptPDF, type ReceiptData } from "@/lib/receipt-generator";
import { apiCreateManualReturnReceipt } from "@/lib/api";

export default function ManualReturnPage() {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    bookTitle: "",
    isbn: "",
    returnDate: new Date().toISOString().split("T")[0],
    lateFeeAmount: "0",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter customer name or ID",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.bookTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter book title",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.isbn.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter ISBN",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.returnDate) {
      toast({
        title: "Validation Error",
        description: "Please select return date",
        variant: "destructive",
      });
      return false;
    }
    const fee = parseFloat(formData.lateFeeAmount || "0");
    if (isNaN(fee) || fee < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid late fee amount",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleGenerateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted, validating...");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    console.log("Form validation passed, starting receipt generation");
    setIsLoading(true);
    try {
      const lateFeeAmount = parseFloat(formData.lateFeeAmount || "0");

      // Generate receipt ID locally for now (will be replaced with backend call)
      const currentYear = new Date().getFullYear();
      const timestamp = Date.now();
      const receiptId = `RCP-${currentYear}-${String(timestamp).slice(-5).padStart(5, "0")}`;

      // Generate PDF with the receipt data
      const receiptData: ReceiptData = {
        receiptId: receiptId,
        customerName: formData.customerName,
        bookTitle: formData.bookTitle,
        isbn: formData.isbn,
        returnDate: formData.returnDate,
        lateFeeAmount: lateFeeAmount,
        paymentMethod: paymentMethod as "cash" | "online" | "waived",
        createdAt: new Date().toISOString(),
        libraryName: "Library Management System",
      };

      await generateReceiptPDF(receiptData);

      toast({
        title: "Success",
        description: `Receipt generated successfully! Receipt ID: ${receiptId}`,
      });

      // Reset form
      setFormData({
        customerName: "",
        customerEmail: "",
        bookTitle: "",
        isbn: "",
        returnDate: new Date().toISOString().split("T")[0],
        lateFeeAmount: "0",
      });
      setPaymentMethod("cash");
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Return Processed",
      description: "Book return has been recorded.",
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6">Manual Book Return</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Process Return & Generate Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateReceipt} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Name / ID *</Label>
              <Input
                placeholder="Enter customer name or ID"
                required
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Email (optional)</Label>
              <Input
                placeholder="customer@example.com"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange("customerEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Book Title *</Label>
              <Input
                placeholder="Enter book title"
                required
                value={formData.bookTitle}
                onChange={(e) => handleInputChange("bookTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ISBN *</Label>
              <Input
                placeholder="978-X-XX-XXXXXX-X"
                required
                value={formData.isbn}
                onChange={(e) => handleInputChange("isbn", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Return Date *</Label>
              <Input
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleInputChange("returnDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Late Fee (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.lateFeeAmount}
                onChange={(e) => handleInputChange("lateFeeAmount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Generating..." : "Generate Receipt"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSubmit}
              >
                Process Return Only
              </Button>
            </div>
            <p className="text-xs text-gray-500 pt-2">* Required fields</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
