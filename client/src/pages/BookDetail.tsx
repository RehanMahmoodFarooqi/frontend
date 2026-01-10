import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, User, ArrowLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { LoginDialog } from "@/components/LoginDialog";

export default function BookDetail() {
  const [match, params] = useRoute("/book/:id");
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [, setLocation] = useLocation();

  const physicalBookId = params?.id;

  useEffect(() => {
    if (physicalBookId) {
      fetchBookDetails();
    }
  }, [physicalBookId]);

  const fetchBookDetails = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/physical-books/${physicalBookId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      } else {
        // Handle 404
        setBook(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExchange = async () => {
    if (!user) {
      toast.error("Please sign in to request an exchange");
      return;
    }
    setExchangeLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/exchanges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          physicalBookId: physicalBookId,
          // receiverId? The backend should define receiver from physicalBook owner.
          // My exchanges.service initiateExchange takes { physicalBookId }. 
          // It looks up the owner.
        })
      });

      if (res.ok) {
        toast.success("Exchange requested successfully!");
        // Update UI
      } else {
        const err = await res.json();
        toast.error(err.error?.message || "Failed to request exchange");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setExchangeLoading(false);
    }
  };

  const [messageLoading, setMessageLoading] = useState(false);

  const handleMessageOwner = async () => {
    if (!user) {
      toast.error("Please sign in to message");
      return;
    }
    setMessageLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      // Create Chat
      const res = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantIds: [user.id, book.currentOwnerId] })
      });

      if (res.ok) {
        const chat = await res.json();
        const initialMessage = encodeURIComponent(`Hi, I'm interested in exchanging for your book "${book.book.title}".`);
        setLocation(`/messages?chatId=${chat.id}&initialMessage=${initialMessage}`);
      } else {
        toast.error("Failed to start chat");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <Link href="/browse"><Button>Back to Browse</Button></Link>
      </div>
    )
  }

  const listing = book.listings?.find((l: any) => l.isActive);
  const imageUrl = listing?.images?.[0]?.url;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image */}
      <div className="h-64 md:h-80 bg-slate-100 relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={book.book.title} className="w-full h-full object-cover blur-sm opacity-50" />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute top-4 left-4 flex gap-4">
          <Link href="/browse">
            <Button variant="secondary" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <Link href={`/book/${physicalBookId}/history`}>
            <Button variant="secondary" size="sm" className="rounded-full">
              Journey 📜
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-48 h-72 rounded-lg shadow-xl overflow-hidden bg-white flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={book.book.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">📖</span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-4 md:pt-32">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{book.book.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{book.book.author}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center bg-secondary/10 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                <span>{book.location || listing?.location || 'Unknown Location'}</span>
              </div>
              <div className="flex items-center bg-secondary/10 px-4 py-2 rounded-full">
                <span>Condition: <span className="font-semibold capitalize">{book.condition.replace('_', ' ')}</span></span>
              </div>
              {/* Points Estimate */}
              <div className="flex items-center bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                <span className="text-accent font-semibold mr-1">
                  {book.valuations && book.valuations.length > 0
                    ? book.valuations[0].finalPoints
                    : (book.condition === 'new' ? '15-20' : '5-10') // Fallback/Estimate if not calculated yet
                  }
                </span>
                <span className="text-muted-foreground text-sm">Points (Est.)</span>
              </div>

              {book.owner && (
                <div className="flex items-center bg-secondary/10 px-4 py-2 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  <span>Listed by {book.owner.name}</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p>{book.book.description || "No description available."}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user?.id !== book.currentOwnerId ? (
                <>
                  <Button size="lg" className="flex-1" onClick={handleRequestExchange} disabled={exchangeLoading}>
                    {exchangeLoading ? "Requesting..." : "Request Exchange"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Logic to create chat would be ideal here, but for now redirect with query param or just list
                      // A better UX is to create the chat if it doesn't exist then redirect.
                      // I will add a handleMessageOwner function.
                      handleMessageOwner();
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Owner
                  </Button>
                </>
              ) : (
                <Button size="lg" variant="secondary" className="flex-1" disabled>
                  You own this book
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
