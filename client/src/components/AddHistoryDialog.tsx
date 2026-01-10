import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PenTool, Plus } from "lucide-react";

interface AddHistoryDialogProps {
    physicalBookId: string;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function AddHistoryDialog({ physicalBookId, onSuccess, trigger }: AddHistoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [city, setCity] = useState("");
    const [readingStart, setReadingStart] = useState("");
    const [readingEnd, setReadingEnd] = useState("");
    const [notes, setNotes] = useState("");
    const [tips, setTips] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddEntry = async () => {
        setLoading(true);
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
                setOpen(false);
                // Reset form
                setCity("");
                setReadingStart("");
                setReadingEnd("");
                setNotes("");
                setTips("");
                if (onSuccess) onSuccess();
            } else {
                const err = await res.json();
                toast.error(err.error?.message || "Failed to add entry");
            }
        } catch (e) {
            console.error(e);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" /> Add Entry
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add to Book History</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>City / Location</Label>
                        <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. London, UK" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Started Reading</Label>
                            <Input type="date" value={readingStart} onChange={e => setReadingStart(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Finished Reading</Label>
                            <Input type="date" value={readingEnd} onChange={e => setReadingEnd(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Tips for next reader</Label>
                        <Textarea value={tips} onChange={e => setTips(e.target.value)} placeholder="Best read with coffee..." />
                    </div>
                    <div className="grid gap-2">
                        <Label>Notes / Thoughts</Label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="I loved chapter 3 because..." />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddEntry} disabled={loading}>
                        {loading ? "Saving..." : "Save Entry"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
