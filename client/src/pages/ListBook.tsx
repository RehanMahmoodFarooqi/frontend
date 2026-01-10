import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Assuming sonner is installed as per ls
import { Loader2 } from "lucide-react";

export default function ListBook() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    condition: "good", // good, like_new, fair, poor
    location: "",
    imageUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, condition: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to list a book");
      return;
    }
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 1. Create Book Metadata
      let bookId;
      const bookRes = await fetch(`${API_URL}/books`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn || undefined,
          description: formData.description
        })
      });

      if (bookRes.status === 409) {
        // ISBN exists, search for it or handle conflict? 
        // For simple flow, if ISBN exists, we might search.
        // But here we might just get error.
        // Or if ISBN exists, our backend says "ISBN_EXISTS".
        // REAL WORLD: We should use existing bookId.
        // For hackathon: Let's assume we search first or user ignores error if they just want to list physical copy?
        // My backend throws error. 
        // Let's implement search-first logic if I had time, but for now, 
        // if CONFLICT, we need to FIND that book.

        // Quick fix: Search by ISBN if conflict
        const searchRes = await fetch(`${API_URL}/books/search?isbn=${formData.isbn}`, { headers });
        const searchData = await searchRes.json();
        if (searchData.books && searchData.books.length > 0) {
          bookId = searchData.books[0].id;
        } else {
          throw new Error("Book exists but could not be found");
        }
      } else if (!bookRes.ok) {
        throw new Error("Failed to create book metadata");
      } else {
        const bookData = await bookRes.json();
        bookId = bookData.id;
      }

      // 2. Create Physical Book
      const pbRes = await fetch(`${API_URL}/physical-books`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bookId,
          condition: formData.condition,
          location: formData.location
        })
      });

      if (!pbRes.ok) throw new Error("Failed to register physical book");
      const pbData = await pbRes.json();

      // 3. Create Listing
      const listRes = await fetch(`${API_URL}/listings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          physicalBookId: pbData.id,
          location: formData.location,
          images: formData.imageUrl ? [{ url: formData.imageUrl }] : []
        })
      });

      if (!listRes.ok) throw new Error("Failed to create listing");

      toast.success("Book listed successfully!");
      // Reset form
      setFormData({
        title: "",
        author: "",
        isbn: "",
        description: "",
        condition: "good",
        location: "",
        imageUrl: ""
      });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground">You need to be logged in to list books for exchange.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>List a Book for Exchange</CardTitle>
          <CardDescription>
            Enter the details of the book you want to give away or exchange.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={formData.title} onChange={handleChange} required placeholder="The Great Gatsby" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={formData.author} onChange={handleChange} required placeholder="F. Scott Fitzgerald" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN (Optional)</Label>
              <Input id="isbn" value={formData.isbn} onChange={handleChange} placeholder="978-3-16-148410-0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="Brief summary or condition notes..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={formData.location} onChange={handleChange} required placeholder="City, State" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Listing...</> : "List Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
