import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Loader2, MessageSquare, Search, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Forums() {
  const { user } = useAuth();
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (query = "") => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      // Use /books endpoint which supports search
      const url = query
        ? `${API_URL}/books/search?query=${encodeURIComponent(query)}`
        : `${API_URL}/books?limit=12`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setForums(data.books || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBooks(search);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Community Forums</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join the conversation. Discuss interpretations, debate chapters, and share your reading journey.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12 flex gap-2">
        <Input
          placeholder="Search for a book title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-12"
        />
        <Button size="lg" onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </Button>
      </div>

      {forums.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forums.map((book) => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/forum/${book.id}`}>
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" /> View Discussions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Start a Discussion</h3>
          <p className="text-muted-foreground">Search for a book above to find or create a community forum.</p>
        </div>
      )}

      {/* Guidelines Section for "Ethical Environment" */}
      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="text-accent" /> Community Guidelines
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div className="bg-secondary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Respectful Debate</h3>
            <p>Critique ideas, not people. Keep debates civil and focused on the book's content.</p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">No Spoilers (Unless Marked)</h3>
            <p>Be mindful of new readers. Use chapter headers to indicate scope of discussion.</p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Zero Tolerance for Abuse</h3>
            <p>Harassment, hate speech, and spam are automatically flagged and removed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
