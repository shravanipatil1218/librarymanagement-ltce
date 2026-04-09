export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  rating: number;
  coverUrl: string;
  available: number;
  total: number;
}

export interface IssuedBook {
  id: string;
  bookId: string;
  book: Book;
  issueDate: string;
  returnDeadline: string;
  returnedDate?: string;
  status: "issued" | "returned" | "overdue";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  branch?: string;
}

export interface Notification {
  id: string;
  type: "return_request" | "payment" | "overdue";
  message: string;
  date: string;
  read: boolean;
  userId?: string;
  bookId?: string;
}

export const genres = [
  "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery",
  "Romance", "Biography", "History", "Science", "Technology",
  "Philosophy", "Poetry", "Drama", "Children", "Self-Help"
];

export const books: Book[] = [
  { id: "1", isbn: "978-0-13-468599-1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.", rating: 4.5, coverUrl: "", available: 3, total: 5 },
  { id: "2", isbn: "978-0-06-112008-4", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.", rating: 4.8, coverUrl: "", available: 1, total: 4 },
  { id: "3", isbn: "978-0-452-28423-4", title: "1984", author: "George Orwell", genre: "Science Fiction", description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.", rating: 4.7, coverUrl: "", available: 2, total: 3 },
  { id: "4", isbn: "978-0-7432-7356-5", title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", description: "The story of Holden Caulfield's experiences in New York City after being expelled from prep school.", rating: 4.1, coverUrl: "", available: 0, total: 2 },
  { id: "5", isbn: "978-0-14-028329-7", title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", description: "Bilbo Baggins enjoys a comfortable life until the wizard Gandalf chooses him to take part in an adventure.", rating: 4.6, coverUrl: "", available: 4, total: 6 },
  { id: "6", isbn: "978-0-06-093546-7", title: "To the Lighthouse", author: "Virginia Woolf", genre: "Fiction", description: "A landmark novel of high modernism centered on the Ramsay family's visits to the Isle of Skye.", rating: 4.0, coverUrl: "", available: 2, total: 3 },
  { id: "7", isbn: "978-0-14-118776-1", title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "Fiction", description: "The story of an impoverished student who plans to kill an unscrupulous pawnbroker.", rating: 4.4, coverUrl: "", available: 1, total: 2 },
  { id: "8", isbn: "978-0-7432-7357-2", title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", description: "From the Big Bang to black holes, a landmark volume in science writing.", rating: 4.3, coverUrl: "", available: 3, total: 4 },
  { id: "9", isbn: "978-0-06-112241-5", title: "Sapiens", author: "Yuval Noah Harari", genre: "History", description: "A brief history of humankind from the Stone Age to the Silicon Age.", rating: 4.5, coverUrl: "", available: 5, total: 7 },
  { id: "10", isbn: "978-0-67-973449-7", title: "The Art of War", author: "Sun Tzu", genre: "Philosophy", description: "An ancient Chinese military treatise dating from the Late Spring and Autumn Period.", rating: 4.2, coverUrl: "", available: 2, total: 3 },
  { id: "11", isbn: "978-0-14-044913-6", title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "Mystery", description: "A psychological thriller following Raskolnikov through the streets of St. Petersburg.", rating: 4.6, coverUrl: "", available: 1, total: 2 },
  { id: "12", isbn: "978-0-39-592720-9", title: "Atomic Habits", author: "James Clear", genre: "Self-Help", description: "Tiny changes, remarkable results. An easy & proven way to build good habits.", rating: 4.8, coverUrl: "", available: 6, total: 8 },
];

export const currentUser: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "+1 555-0123",
  role: "customer",
  branch: "Main Library",
};

export const adminUser: User = {
  id: "admin1",
  name: "Sarah Admin",
  email: "admin@library.com",
  phone: "+1 555-0100",
  role: "admin",
};

export const issuedBooks: IssuedBook[] = [
  { id: "ib1", bookId: "1", book: books[0], issueDate: "2026-03-20", returnDeadline: "2026-04-10", status: "overdue" },
  { id: "ib2", bookId: "5", book: books[4], issueDate: "2026-04-01", returnDeadline: "2026-04-15", status: "issued" },
  { id: "ib3", bookId: "9", book: books[8], issueDate: "2026-04-05", returnDeadline: "2026-04-19", status: "issued" },
];

export const bookHistory: IssuedBook[] = [
  { id: "ib4", bookId: "3", book: books[2], issueDate: "2026-02-01", returnDeadline: "2026-02-15", returnedDate: "2026-02-14", status: "returned" },
  { id: "ib5", bookId: "8", book: books[7], issueDate: "2026-01-10", returnDeadline: "2026-01-24", returnedDate: "2026-01-23", status: "returned" },
  { id: "ib6", bookId: "10", book: books[9], issueDate: "2025-12-01", returnDeadline: "2025-12-15", returnedDate: "2025-12-18", status: "returned" },
];

export const customers: User[] = [
  { id: "u1", name: "Alex Johnson", email: "alex@example.com", phone: "+1 555-0123", role: "customer", branch: "Main Library" },
  { id: "u2", name: "Maria Garcia", email: "maria@example.com", phone: "+1 555-0456", role: "customer", branch: "West Branch" },
  { id: "u3", name: "James Wilson", email: "james@example.com", phone: "+1 555-0789", role: "customer", branch: "East Branch" },
  { id: "u4", name: "Emma Davis", email: "emma@example.com", phone: "+1 555-0321", role: "customer", branch: "Main Library" },
];

export const adminNotifications: Notification[] = [
  { id: "n1", type: "return_request", message: "Alex Johnson requested to return 'The Great Gatsby'", date: "2026-04-09", read: false, userId: "u1", bookId: "1" },
  { id: "n2", type: "payment", message: "Maria Garcia paid ₹150 late fee for 'Sapiens'", date: "2026-04-08", read: false, userId: "u2" },
  { id: "n3", type: "overdue", message: "James Wilson's '1984' is overdue by 3 days", date: "2026-04-07", read: true, userId: "u3", bookId: "3" },
];

export function calculateFine(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffDays = Math.floor((today.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * 10 : 0; // ₹10 per day
}

export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
