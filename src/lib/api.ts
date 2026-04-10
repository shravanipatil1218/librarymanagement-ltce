

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/library-api`;

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${FUNCTION_URL}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

// Auth
export const apiLogin = (email: string, password: string) =>
  apiFetch("auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const apiSignup = (name: string, email: string, password: string, role: string, phone?: string, branch?: string) =>
  apiFetch("auth/signup", { method: "POST", body: JSON.stringify({ name, email, password, role, phone, branch }) });

// Books
export const apiGetBooks = (params?: { genre?: string; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.genre) qs.set("genre", params.genre);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiFetch(`books${query ? `?${query}` : ""}`);
};

export const apiGetGenres = () => apiFetch("books/genres");

export const apiIssueBook = (userId: string, bookId: string, issueDate: string, returnDeadline: string) =>
  apiFetch("books/issue", { method: "POST", body: JSON.stringify({ userId, bookId, issueDate, returnDeadline }) });

export const apiReturnBook = (issuedBookId: string, returnDate: string) =>
  apiFetch("books/return", { method: "POST", body: JSON.stringify({ issuedBookId, returnDate }) });

export const apiGetBookAvailability = () => apiFetch("books/availability");

// Issued Books
export const apiGetIssuedBooks = (userId?: string, status?: string) => {
  const qs = new URLSearchParams();
  if (userId) qs.set("userId", userId);
  if (status) qs.set("status", status);
  const query = qs.toString();
  return apiFetch(`issued-books${query ? `?${query}` : ""}`);
};

// Customers
export const apiGetCustomers = () => apiFetch("customers");

// Notifications
export const apiGetNotifications = () => apiFetch("notifications");
export const apiCreateNotification = (type: string, message: string, userId?: string, bookId?: string) =>
  apiFetch("notifications", { method: "POST", body: JSON.stringify({ type, message, userId, bookId }) });
export const apiUpdateNotification = (id: string, is_read: boolean) =>
  apiFetch(`notifications/${id}`, { method: "PATCH", body: JSON.stringify({ is_read }) });

// Payments
export const apiGetPayments = (userId?: string) => {
  const qs = new URLSearchParams();
  if (userId) qs.set("userId", userId);
  return apiFetch(`payments${qs.toString() ? `?${qs}` : ""}`);
};
export const apiCreatePayment = (userId: string, amount: number, paymentType: string, issuedBookId?: string, description?: string) =>
  apiFetch("payments", { method: "POST", body: JSON.stringify({ userId, issuedBookId, amount, paymentType, description }) });
