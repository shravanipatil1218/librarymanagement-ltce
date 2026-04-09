import { Book } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface BookCardProps {
  book: Book;
  onClick?: (book: Book) => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow border-border group"
        onClick={() => onClick?.(book)}
      >
        <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center relative overflow-hidden">
          <BookOpen className="w-16 h-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
          <div className="absolute top-2 right-2">
            <Badge variant={book.available > 0 ? "default" : "destructive"} className="text-xs">
              {book.available > 0 ? `${book.available} available` : "Unavailable"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1">{book.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs">{book.genre}</Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-secondary text-secondary" />
              {book.rating}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
