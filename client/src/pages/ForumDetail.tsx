import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2, User, Send, Flag, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ForumDetail() {
  const [match, params] = useRoute("/forum/:id"); // Book ID
  const { user } = useAuth();

  // State
  const [book, setBook] = useState<any>(null);
  const [activeForumId, setActiveForumId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post
  const [newPostContent, setNewPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [chapter, setChapter] = useState("");

  const bookId = params?.id;

  useEffect(() => {
    if (bookId) {
      fetchData();
    }
  }, [bookId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      // 1. Get Book Details
      const bRes = await fetch(`${API_URL}/books/${bookId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBook(bData);
      }

      // 2. Get Forums (Topics)
      // Backend Route: /api/books/:bookId/forums => { bookId, forums: [] }
      const fRes = await fetch(`${API_URL}/books/${bookId}/forums`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (fRes.ok) {
        const fJson = await fRes.json();
        const forumList = fJson.forums || [];

        // Simplify: Just use the first one or create "General"
        let general = forumList.find((f: any) => f.title === "General Discussion");

        if (!general && forumList.length > 0) {
          general = forumList[0]; // Fallback to first existing
        }

        if (!general && token) {
          // Create Default Forum
          try {
            const createRes = await fetch(`${API_URL}/forums`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ bookId, title: "General Discussion" })
            });
            if (createRes.ok) {
              general = await createRes.json();
            }
          } catch (e) {
            console.error("Failed to auto-create forum", e);
          }
        }

        if (general) {
          setActiveForumId(general.id);
        } else {
          // Even if creation failed or not logged in, stop loading
          setLoading(false);
        }
      } else {
        // 404 or 403
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when activeForumId is set
  useEffect(() => {
    if (activeForumId) {
      fetchPosts(activeForumId);
    }
  }, [activeForumId]);

  const fetchPosts = async (forumId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/forums/${forumId}/posts`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (e) { console.error(e); }
  };

  const handlePost = async () => {
    if (!user) return toast.error("Login required to post");
    if (!newPostContent) return;

    // Safety check: if no forum exists yet (e.g. user not logged in during auto-create), warn user
    if (!activeForumId) return toast.error("Discussion channel initializing... please refresh or log in.");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/forums/${activeForumId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          isAnonymous,
          chapter: chapter || undefined
        })
      });

      if (res.ok) {
        const post = await res.json();
        if (post.isFlagged) {
          toast.warning("Flagged for review due to inappropriate content.");
        } else {
          toast.success("Posted!");
        }
        setNewPostContent("");
        fetchPosts(activeForumId!);
      } else {
        const err = await res.json();
        if (err.error?.message?.includes('ABUSIVE_CONTENT')) {
          toast.error("Message blocked: Contains inappropriate words.");
        } else {
          toast.error("Failed to post message.");
        }
      }
    } catch (e) { console.error(e); }
  };

  if (loading && !book) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto py-6 px-4 h-[calc(100vh-64px)] flex flex-col max-w-4xl">
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold">{book?.title || "Book Debate"}</h1>
        <p className="text-muted-foreground">Open Debate & Discussion</p>
      </div>

      {/* Chat Area - Single Stream */}
      <div className="flex-1 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">

        {!activeForumId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            {user ? (
              <>
                <p className="mb-2">Starting conversation...</p>
                <Loader2 className="animate-spin" />
              </>
            ) : (
              <p>Please log in to initiate the debate!</p>
            )}
          </div>
        ) : (
          <>
            {/* Posts List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {posts.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No debate yet. Start the conversation!
                </div>
              )}
              {posts.map(post => (
                <div key={post.id} className={`flex gap-4 ${post.isFlagged ? "opacity-50" : ""}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${post.isAnonymous ? "bg-slate-200" : "bg-primary/10 text-primary"
                    }`}>
                    {post.isAnonymous ? <User className="w-5 h-5 opacity-50" /> : <div className="font-bold">{post.authorName?.[0] || "U"}</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {post.isAnonymous ? "Anonymous" : post.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.createdAt), 'MMM d, h:mm a')}
                      </span>
                      {post.chapter && (
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          Ch {post.chapter}
                        </span>
                      )}
                      {post.isFlagged && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Flagged
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-800 leading-relaxed">
                      {post.isFlagged ? (
                        <em className="text-muted-foreground">This content has been flagged for review.</em>
                      ) : post.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex flex-col gap-3">
                <Textarea
                  placeholder={user ? "Share your opinion..." : "Please log in to debate"}
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  disabled={!user}
                  className="min-h-[80px] bg-white"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anon"
                        checked={isAnonymous}
                        onCheckedChange={(c) => setIsAnonymous(!!c)}
                      />
                      <Label htmlFor="anon" className="text-sm text-muted-foreground cursor-pointer">Post Anonymously</Label>
                    </div>
                    <Input
                      className="w-24 h-8 text-xs bg-white"
                      placeholder="Ch?"
                      value={chapter}
                      onChange={e => setChapter(e.target.value)}
                    />
                  </div>
                  <Button onClick={handlePost} disabled={!user || !newPostContent}>
                    <Send className="w-4 h-4 mr-2" /> Post
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
