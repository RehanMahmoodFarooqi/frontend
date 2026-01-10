import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Heart } from "lucide-react";
import { Link } from "wouter";

export default function BrowseBooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allBooks, setAllBooks] = useState<any[]>([]); // Store all
  const [books, setBooks] = useState<any[]>([]); // Displayed
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);

  useEffect(() => {
    // Initial Fetch
    const params = new URLSearchParams(window.location.search);
    const oid = params.get("ownerId");
    if (oid) setOwnerFilter(oid);

    fetchListings();
  }, []);

  // Filter Effect
  useEffect(() => {
    let result = allBooks;

    // Owner Filter
    if (ownerFilter) {
      result = result.filter(l => l.listedById === ownerFilter);
    }

    // Search Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.physicalBook?.book?.title?.toLowerCase().includes(lower) ||
        l.physicalBook?.book?.author?.toLowerCase().includes(lower)
      );
    }

    setBooks(result);
  }, [allBooks, searchQuery, ownerFilter]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Fetch ALL (limit 1000)
      const res = await fetch(`${API_URL}/listings?limit=1000`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAllBooks(data.listings || []);
      }
    } catch (error) {
      console.error("Failed to fetch listings", error);
    } finally {
      setIsLoading(false);
      setLoadingInitial(false);
    }
  };

  const clearFilter = () => {
    setOwnerFilter(null);
    window.history.pushState({}, '', '/browse');
    // Effect will update 'books'
  };

  // handleSearch just updates state, no fetch
  const handleSearch = () => {
    // Input onChange already updates searchQuery, strict mode might wait for Enter? 
    // The current Input updates state on change.
    // So filtering happens automatically via Effect.
    // I can remove handleSearch or make it empty/dummy if I want real-time.
    // Or keep it if I want "Search" button to do something specific, but with Effect it's reactive.
    // I'll make the Search button just focus or do nothing since it's reactive.
    // Actually, typically "Search" button implies "Submit". 
    // User says "search bar is not working".
    // Reactive is better.
  };

  return (
    <div className="min-h-screen bg-subtle-gradient py-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter">
            Discover <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Next Reads</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Explore a curated community collection of books available for exchange. Find your next adventure today.
          </p>
        </div>

        <div className="mb-16 max-w-2xl mx-auto relative z-10 sticky top-24">
          <div className="glass p-2 rounded-full flex gap-2 shadow-xl shadow-primary/5 ring-1 ring-white/50">
            <Input
              placeholder="Search by title, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 text-lg px-6 h-12 placeholder:text-muted-foreground/50"
            />
            <Button
              className="rounded-full h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>

          {ownerFilter && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-foreground px-4 py-2 rounded-full shadow-sm animate-in fade-in slide-in-from-top-1">
                <span className="text-sm font-medium">Filtering by Owner</span>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 rounded-full hover:bg-black/5" onClick={clearFilter}>X</Button>
              </div>
            </div>
          )}
        </div>

        {loadingInitial ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin w-12 h-12 text-primary opacity-50" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground text-xl">
              {searchQuery || ownerFilter ? "No books match your filters." : "No active listings found. Be the first to list one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((listing) => {
              const book = listing.physicalBook?.book;
              if (!book) return null;
              const images = listing.images as any[];
              const imageUrl = images && images.length > 0 ? images[0].url : null;

              return (
                <Link key={listing.id} href={`/book/${listing.physicalBookId}`}>
                  <a className="group h-full block">
                    <div className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col bg-white">
                      {/* Image Container */}
                      <div className="aspect-[3/4] relative overflow-hidden bg-secondary/10">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">📖</div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                        {/* Floating Badge */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span className="bg-white/90 backdrop-blur-md text-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                            {listing.physicalBook.condition.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Quick View Info on Image */}
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex items-center gap-2 text-xs font-medium opacity-90 mb-1">
                            <span className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{listing.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1 relative">
                        <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 font-medium">{book.author}</p>

                        <div className="mt-auto pt-4 border-t border-dashed border-border flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-accent font-bold bg-accent/5 px-2.5 py-1 rounded-lg">
                            <span className="text-sm">1 Credit</span>
                          </div>
                          <Button size="sm" variant="ghost" className="rounded-full h-8 text-xs font-semibold group-hover:bg-primary group-hover:text-white transition-all">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
