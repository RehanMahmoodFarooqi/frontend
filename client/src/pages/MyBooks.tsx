import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Link } from "wouter";
import { EditBookDialog } from "@/components/EditBookDialog";
import { AddHistoryDialog } from "@/components/AddHistoryDialog";

interface PhysicalBook {
  id: string;
  condition: string;
  status: string;
  isAvailable: boolean;
  location: string;
  book: {
    id: string;
    title: string;
    author: string;
    description: string;
  };
  listings: any[];
}

export default function MyBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<PhysicalBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/physical-books/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">My Books</h1>
        <p className="text-muted-foreground">Please sign in to view your books.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-accent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-muted-foreground">Manage your physical collection and listings.</p>
        </div>
        <Link href="/list-book">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            List a Book
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-slate-50">
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground mb-4">You haven't listed any books yet.</p>
          <Link href="/list-book">
            <Button variant="outline">List your first book</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((item) => {
            // Determine display location from active listing or updated item
            const activeListing = item.listings?.find((l: any) => l.isActive);
            const displayLocation = activeListing?.location || item.location || "Unknown";
            const displayStatus = item.isAvailable ? "available" : "unavailable";

            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{item.book.title}</CardTitle>
                  <CardDescription>{item.book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="capitalize">{item.condition.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{displayLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`capitalize font-medium ${displayStatus === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                        {displayStatus}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex flex-col w-full gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <EditBookDialog book={item} onUpdate={fetchBooks} />
                      <AddHistoryDialog
                        physicalBookId={item.id}
                        trigger={
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="w-3 h-3 mr-1" /> Log
                          </Button>
                        }
                      />
                    </div>
                    <Link href={`/book/${item.id}/history`}>
                      <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">View Full History</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
