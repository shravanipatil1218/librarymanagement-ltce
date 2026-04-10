const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

async function getConnection() {
  const dbUrl = Deno.env.get("TIDB_DATABASE_URL");
  if (!dbUrl) throw new Error("TIDB_DATABASE_URL is not configured");
  
  const match = dbUrl.match(/mysql:\/\/([^.]+)\.([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) throw new Error("Invalid MySQL connection URL");

  const client = await new Client().connect({
    hostname: match[4],
    port: parseInt(match[5]),
    username: `${match[1]}.${match[2]}`,
    password: match[3],
    db: match[6],
    tls: { mode: "verify_identity" },
  });
  return client;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let client: Client | null = null;
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/library-api\/?/, "");
    client = await getConnection();

    // --- AUTH ---
    if (path === "auth/login" && req.method === "POST") {
      const { email, password } = await req.json();
      const rows = await client.query("SELECT id, name, email, phone, role, branch FROM users WHERE email = ? AND password_hash = ?", [email, password]);
      if (rows.length === 0) return json({ error: "Invalid credentials" }, 401);
      return json({ user: rows[0] });
    }

    if (path === "auth/signup" && req.method === "POST") {
      const { name, email, password, role, phone, branch } = await req.json();
      const id = crypto.randomUUID();
      await client.execute("INSERT INTO users (id, name, email, phone, password_hash, role, branch) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, name, email, phone || "", password, role || "customer", branch || null]);
      return json({ user: { id, name, email, phone: phone || "", role: role || "customer", branch } }, 201);
    }

    // --- BOOKS ---
    if (path === "books" && req.method === "GET") {
      const genre = url.searchParams.get("genre");
      const search = url.searchParams.get("search");
      let query = "SELECT * FROM books";
      const params: string[] = [];
      if (genre) { query += " WHERE genre = ?"; params.push(genre); }
      else if (search) { query += " WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
      return json(await client.query(query, params));
    }

    if (path === "books/genres" && req.method === "GET") {
      const rows = await client.query("SELECT DISTINCT genre FROM books ORDER BY genre");
      return json(rows.map((r: any) => r.genre));
    }

    if (path === "books/issue" && req.method === "POST") {
      const { userId, bookId, issueDate, returnDeadline } = await req.json();
      const id = crypto.randomUUID();
      await client.execute("INSERT INTO issued_books (id, user_id, book_id, issue_date, return_deadline, status) VALUES (?, ?, ?, ?, ?, 'issued')", [id, userId, bookId, issueDate, returnDeadline]);
      await client.execute("UPDATE books SET available = available - 1 WHERE id = ? AND available > 0", [bookId]);
      return json({ id, success: true }, 201);
    }

    // --- ISSUED BOOKS ---
    if (path === "issued-books" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      const status = url.searchParams.get("status");
      let query = `SELECT ib.id, ib.user_id, ib.book_id, ib.issue_date, ib.return_deadline, ib.returned_date, ib.status,
                    b.title, b.author, b.isbn, b.genre, b.description, b.rating, b.cover_url, b.available, b.total 
                    FROM issued_books ib JOIN books b ON ib.book_id = b.id WHERE 1=1`;
      const params: string[] = [];
      if (userId) { query += " AND ib.user_id = ?"; params.push(userId); }
      if (status) { query += " AND ib.status = ?"; params.push(status); }
      query += " ORDER BY ib.created_at DESC";
      return json(await client.query(query, params));
    }

    // --- RETURN BOOK ---
    if (path === "books/return" && req.method === "POST") {
      const { issuedBookId, returnDate } = await req.json();
      await client.execute("UPDATE issued_books SET status = 'returned', returned_date = ? WHERE id = ?", [returnDate, issuedBookId]);
      const rows = await client.query("SELECT book_id FROM issued_books WHERE id = ?", [issuedBookId]);
      if (rows.length > 0) await client.execute("UPDATE books SET available = available + 1 WHERE id = ?", [rows[0].book_id]);
      return json({ success: true });
    }

    // --- CUSTOMERS ---
    if (path === "customers" && req.method === "GET") {
      return json(await client.query("SELECT id, name, email, phone, role, branch FROM users WHERE role = 'customer'"));
    }

    // --- NOTIFICATIONS ---
    if (path === "notifications" && req.method === "GET") {
      return json(await client.query("SELECT * FROM notifications ORDER BY created_at DESC"));
    }

    if (path === "notifications" && req.method === "POST") {
      const { type, message, userId, bookId } = await req.json();
      const id = crypto.randomUUID();
      await client.execute("INSERT INTO notifications (id, type, message, user_id, book_id) VALUES (?, ?, ?, ?, ?)", [id, type, message, userId || null, bookId || null]);
      return json({ id, success: true }, 201);
    }

    if (path.startsWith("notifications/") && req.method === "PATCH") {
      const notifId = path.split("/")[1];
      const { is_read } = await req.json();
      await client.execute("UPDATE notifications SET is_read = ? WHERE id = ?", [is_read, notifId]);
      return json({ success: true });
    }

    // --- PAYMENTS ---
    if (path === "payments" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      let query = "SELECT * FROM payments";
      const params: string[] = [];
      if (userId) { query += " WHERE user_id = ?"; params.push(userId); }
      query += " ORDER BY created_at DESC";
      return json(await client.query(query, params));
    }

    if (path === "payments" && req.method === "POST") {
      const { userId, issuedBookId, amount, paymentType, description } = await req.json();
      const id = crypto.randomUUID();
      await client.execute("INSERT INTO payments (id, user_id, issued_book_id, amount, payment_type, status, description) VALUES (?, ?, ?, ?, ?, 'completed', ?)", [id, userId, issuedBookId || null, amount, paymentType || "online", description || null]);
      return json({ id, success: true }, 201);
    }

    // --- BOOK AVAILABILITY ---
    if (path === "books/availability" && req.method === "GET") {
      return json(await client.query("SELECT id, isbn, title, author, genre, available, total FROM books ORDER BY title"));
    }

    return json({ error: "Not found" }, 404);
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 500);
  } finally {
    if (client) await client.close();
  }
});
