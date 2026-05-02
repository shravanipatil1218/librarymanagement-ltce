import { apiCreateNotification } from "./api";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/library-api`;

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${FUNCTION_URL}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export interface ManualReturnReceiptInput {
  customerName: string;
  customerEmail?: string;
  bookTitle: string;
  isbn: string;
  returnDate: string;
  lateFeeAmount: number;
  paymentMethod: "cash" | "online" | "waived";
}

export interface ManualReturnReceiptResponse {
  receiptId: string;
  id: string;
  createdAt: string;
  success: boolean;
  message: string;
}

/**
 * Save manual return receipt to database and get sequential receipt ID
 */
export async function saveManualReturnReceipt(
  data: ManualReturnReceiptInput
): Promise<ManualReturnReceiptResponse> {
  try {
    const response = await apiFetch("manual-returns/receipts", {
      method: "POST",
      body: JSON.stringify({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        bookTitle: data.bookTitle,
        isbn: data.isbn,
        returnDate: data.returnDate,
        lateFeeAmount: data.lateFeeAmount,
        paymentMethod: data.paymentMethod,
      }),
    });

    // Create notification for admin audit trail
    try {
      await apiCreateNotification(
        "manual_return",
        `Receipt generated for customer ${data.customerName} - Book: ${data.bookTitle} - Receipt ID: ${response.receiptId}`,
        undefined,
        undefined
      );
    } catch (notifError) {
      console.warn("Failed to create notification:", notifError);
      // Don't throw - this is non-critical
    }

    return response;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to save receipt to database"
    );
  }
}

/**
 * Generate the next sequential receipt ID
 * Format: RCP-YYYY-XXXXX where XXXXX is zero-padded number
 */
export function formatReceiptId(
  sequenceNumber: number,
  year: number = new Date().getFullYear()
): string {
  const paddedNumber = String(sequenceNumber).padStart(5, "0");
  return `RCP-${year}-${paddedNumber}`;
}
