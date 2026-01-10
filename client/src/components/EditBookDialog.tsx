import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditBookDialogProps {
    book: any;
    onUpdate: () => void;
}

export function EditBookDialog({ book, onUpdate }: EditBookDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [condition, setCondition] = useState(book.condition);
    const [location, setLocation] = useState(book.listings?.[0]?.location || "");
    const [status, setStatus] = useState(book.isAvailable ? "available" : "unavailable");

    const handleSave = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/physical-books/${book.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    condition,
                    location, // Handles active listing update in backend if present
                    isAvailable: status === 'available'
                })
            });

            if (res.ok) {
                toast.success("Book updated successfully");
                setOpen(false);
                onUpdate();
            } else {
                toast.error("Failed to update book");
            }
        } catch (e) {
            console.error(e);
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Book Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="like_new">Like New</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                                <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Campus Library" />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleSave} className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
