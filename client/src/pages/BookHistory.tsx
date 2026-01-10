import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2, MapPin, Calendar, User, PenTool, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { AddHistoryDialog } from "@/components/AddHistoryDialog";

export default function BookHistory() {
    const [match, params] = useRoute("/book/:id/history");
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const physicalBookId = params?.id;

    // Form
    const [city, setCity] = useState("");
    const [readingStart, setReadingStart] = useState("");
    const [readingEnd, setReadingEnd] = useState("");
    const [notes, setNotes] = useState("");
    const [tips, setTips] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (physicalBookId) {
            fetchData();
        }
    }, [physicalBookId]);

    const fetchData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // Fetch Book Info
            const bookRes = await fetch(`${API_URL}/physical-books/${physicalBookId}`);
            if (bookRes.ok) {
                const bData = await bookRes.json();
                setBook(bData);
            }

            // Fetch History
            const res = await fetch(`${API_URL}/physical-books/${physicalBookId}/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEntry = async () => {
        if (!user) return toast.error("Login required");

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/physical-books/${physicalBookId}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    city, readingStart, readingEnd, notes, tips
                })
            });

            if (res.ok) {
                toast.success("Journey entry added!");
                setDialogOpen(false);
                fetchData();
                // Reset form
                setCity(""); setNotes(""); setTips("");
            } else {
                toast.error("Failed to add entry");
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Scan to View History</h3>
                    <div className="bg-white p-2 inline-block">
                        <QRCode value={window.location.href} size={120} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">ID: {physicalBookId?.slice(0, 8)}...</p>
                </div>

                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">Book Journey</h1>
                    {book && <h2 className="text-xl text-primary">{book.book.title}</h2>}
                    <p className="text-muted-foreground">Trace the path this book has traveled across cities and readers.</p>
                </div>

                {book && user?.id === book.currentOwnerId && (
                    <AddHistoryDialog
                        physicalBookId={physicalBookId}
                        onSuccess={fetchData}
                        trigger={<Button><Plus className="w-4 h-4 mr-2" /> Add My Entry</Button>}
                    />
                )}
            </div>

            {/* Timeline */}
            <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 space-y-8 pb-8">
                {history.length === 0 && (
                    <div className="ml-6 text-muted-foreground">No history recorded yet. Be the first!</div>
                )}

                {history.map((entry) => (
                    <div key={entry.id} className="relative ml-6 bg-white p-6 rounded-lg border shadow-sm">
                        <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-sm" />

                        <div className="flex flex-wrap justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{entry.readerName || "Anonymous Reader"}</p>
                                    {entry.city && (
                                        <p className="text-xs text-muted-foreground flex items-center">
                                            <MapPin className="w-3 h-3 mr-1" /> {entry.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center bg-slate-50 px-2 py-1 rounded">
                                <Calendar className="w-3 h-3 mr-1" />
                                {entry.readingEnd ? format(new Date(entry.readingEnd), 'MMM yyyy') : format(new Date(entry.createdAt), 'MMM yyyy')}
                            </div>
                        </div>

                        {(entry.tips || entry.notes) && (
                            <div className="bg-secondary/5 p-4 rounded-md space-y-3">
                                {entry.tips && (
                                    <div className="text-sm">
                                        <span className="font-semibold text-accent-foreground">💡 Tip:</span> {entry.tips}
                                    </div>
                                )}
                                {entry.notes && (
                                    <div className="text-sm italic text-slate-600">
                                        "{entry.notes}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
