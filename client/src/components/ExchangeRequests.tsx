import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function ExchangeRequests() {
    const { user, refresh } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/users/${user?.id}/exchanges`, { // Using existing endpoint
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter only incoming requests (where I am the giver)
                // data is { total, exchanges: [] }
                const exchangeList = data.exchanges || (Array.isArray(data) ? data : []);
                // Show Pending OR Completed (for history/disputes)
                const relevant = exchangeList.filter((ex: any) =>
                    ex.giverId === user?.id &&
                    (ex.status === 'pending' || ex.status === 'completed' || ex.status === 'disputed')
                );
                setRequests(relevant);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (exchangeId: string, action: 'accept' | 'reject' | 'dispute') => {
        let reason = "";
        if (action === 'dispute') {
            const input = window.prompt("Please describe the issue with this exchange:");
            if (!input) return;
            reason = input;
        }

        setActionLoading(exchangeId);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');

            let url = `${API_URL}/exchanges/${exchangeId}/${action}`;
            let method = 'PUT';
            let body = null;

            if (action === 'dispute') {
                url = `${API_URL}/exchanges/${exchangeId}/disputes`;
                method = 'POST';
                body = JSON.stringify({ reason });
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: body
            });

            if (res.ok) {
                toast.success(`Exchange ${action}ed successfully`);
                fetchRequests();
                refresh(); // Update points balance
            } else {
                const err = await res.json();
                toast.error(err.error?.message || `Failed to ${action} exchange`);
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    if (requests.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-slate-50 mt-8">
                <p className="text-muted-foreground">No incoming exchange requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-8">
            <h2 className="text-xl font-bold">Incoming Requests</h2>
            <div className="grid gap-4">
                {requests.map((req) => (
                    <Card key={req.id}>
                        <CardHeader>
                            <CardTitle className="text-base">Request for: {req.physicalBook.book.title}</CardTitle>
                            <CardDescription>
                                From: {req.receiver.name} • Points: {req.pointsCharged} • Status: <span className="capitalize font-semibold">{req.status}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                            {/* Dispute Button for Completed Exchanges */}
                            {req.status === 'completed' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleAction(req.id, 'dispute' as any)} // Typo fix in next step if generic doesn't match
                                >
                                    Report Issue
                                </Button>
                            )}

                            {req.status === 'pending' && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAction(req.id, 'reject')}
                                        disabled={actionLoading === req.id}
                                    >
                                        <X className="w-4 h-4 mr-2" /> Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAction(req.id, 'accept')}
                                        disabled={actionLoading === req.id}
                                    >
                                        {actionLoading === req.id ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                        Accept
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
