import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "npm:mysql2@3.11.0/promise";

interface ConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: { rejectUnauthorized: boolean };
}

function parseConnectionUrl(url: string): ConnectionConfig {
  // mysql://user:pass@host:port/db?ssl=...
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) throw new Error("Invalid MySQL connection URL");
  return {
    host: match[3],
    port: parseInt(match[4]),
    user: match[1],
    password: match[2],
    database: match[5],
    ssl: { rejectUnauthorized: true },
  };
}

async function getConnection() {
  const dbUrl = Deno.env.get("TIDB_DATABASE_URL");
  if (!dbUrl) throw new Error("TIDB_DATABASE_URL is not configured");
  const config = parseConnectionUrl(dbUrl);
  return await createClient(config);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let conn;
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/library-api\/?/, "");
    conn = await getConnection();

    // --- AUTH ---
    if (path === "auth/login" && req.method === "POST") {
      const { email, password } = await req.json();
      const [rows] = await conn.execute("SELECT id, name, email, phone, role, branch FROM users WHERE email = ? AND password_hash = ?", [email, password]);
      const users = rows as any[];
      if (users.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ user: users[0] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "auth/signup" && req.method === "POST") {
      const { name, email, password, role, phone, branch } = await req.json();
      const id = crypto.randomUUID();
      await conn.execute("INSERT INTO users (id, name, email, phone, password_hash, role, branch) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, name, email, phone || "", password, role || "customer", branch || null]);
      return new Response(JSON.stringify({ user: { id, name, email, phone: phone || "", role: role || "customer", branch } }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- BOOKS ---
    if (path === "books" && req.method === "GET") {
      const genre = url.searchParams.get("genre");
      const search = url.searchParams.get("search");
      let query = "SELECT * FROM books";
      const params: string[] = [];
      if (genre) { query += " WHERE genre = ?"; params.push(genre); }
      else if (search) { query += " WHERE MATCH(title, author, isbn) AGAINST(? IN BOOLEAN MODE)"; params.push(`*${search}*`); }
      const [rows] = await conn.execute(query, params);
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "books/genres" && req.method === "GET") {
      const [rows] = await conn.execute("SELECT DISTINCT genre FROM books ORDER BY genre");
      const genres = (rows as any[]).map(r => r.genre);
      return new Response(JSON.stringify(genres), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "books/issue" && req.method === "POST") {
      const { userId, bookId, issueDate, returnDeadline } = await req.json();
      const id = crypto.randomUUID();
      await conn.execute("INSERT INTO issued_books (id, user_id, book_id, issue_date, return_deadline, status) VALUES (?, ?, ?, ?, ?, 'issued')", [id, userId, bookId, issueDate, returnDeadline]);
      await conn.execute("UPDATE books SET available = available - 1 WHERE id = ? AND available > 0", [bookId]);
      return new Response(JSON.stringify({ id, success: true }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- ISSUED BOOKS ---
    if (path === "issued-books" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      const status = url.searchParams.get("status");
      let query = `SELECT ib.*, b.title, b.author, b.isbn, b.genre, b.description, b.rating, b.cover_url, b.available, b.total 
                    FROM issued_books ib JOIN books b ON ib.book_id = b.id WHERE 1=1`;
      const params: string[] = [];
      if (userId) { query += " AND ib.user_id = ?"; params.push(userId); }
      if (status) { query += " AND ib.status = ?"; params.push(status); }
      query += " ORDER BY ib.created_at DESC";
      const [rows] = await conn.execute(query, params);
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- RETURN BOOK ---
    if (path === "books/return" && req.method === "POST") {
      const { issuedBookId, returnDate } = await req.json();
      await conn.execute("UPDATE issued_books SET status = 'returned', returned_date = ? WHERE id = ?", [returnDate, issuedBookId]);
      const [rows] = await conn.execute("SELECT book_id FROM issued_books WHERE id = ?", [issuedBookId]);
      const bookId = (rows as any[])[0]?.book_id;
      if (bookId) await conn.execute("UPDATE books SET available = available + 1 WHERE id = ?", [bookId]);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- CUSTOMERS (admin) ---
    if (path === "customers" && req.method === "GET") {
      const [rows] = await conn.execute("SELECT id, name, email, phone, role, branch FROM users WHERE role = 'customer'");
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- NOTIFICATIONS ---
    if (path === "notifications" && req.method === "GET") {
      const [rows] = await conn.execute("SELECT * FROM notifications ORDER BY created_at DESC");
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "notifications" && req.method === "POST") {
      const { type, message, userId, bookId } = await req.json();
      const id = crypto.randomUUID();
      await conn.execute("INSERT INTO notifications (id, type, message, user_id, book_id) VALUES (?, ?, ?, ?, ?)", [id, type, message, userId || null, bookId || null]);
      return new Response(JSON.stringify({ id, success: true }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path.startsWith("notifications/") && req.method === "PATCH") {
      const notifId = path.split("/")[1];
      const { is_read } = await req.json();
      await conn.execute("UPDATE notifications SET is_read = ? WHERE id = ?", [is_read, notifId]);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- PAYMENTS ---
    if (path === "payments" && req.method === "GET") {
      const userId = url.searchParams.get("userId");
      let query = "SELECT * FROM payments";
      const params: string[] = [];
      if (userId) { query += " WHERE user_id = ?"; params.push(userId); }
      query += " ORDER BY created_at DESC";
      const [rows] = await conn.execute(query, params);
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "payments" && req.method === "POST") {
      const { userId, issuedBookId, amount, paymentType, description } = await req.json();
      const id = crypto.randomUUID();
      await conn.execute("INSERT INTO payments (id, user_id, issued_book_id, amount, payment_type, status, description) VALUES (?, ?, ?, ?, ?, 'completed', ?)", [id, userId, issuedBookId || null, amount, paymentType || "online", description || null]);
      return new Response(JSON.stringify({ id, success: true }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- BOOK AVAILABILITY ---
    if (path === "books/availability" && req.method === "GET") {
      const [rows] = await conn.execute("SELECT id, isbn, title, author, genre, available, total FROM books ORDER BY title");
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } finally {
    if (conn) await conn.end();
  }
});
