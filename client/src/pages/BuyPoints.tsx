import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Coins } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function BuyPoints() {
    const { user, refresh } = useAuth();
    const [, setLocation] = useLocation();
    const [points, setPoints] = useState<number>(10);
    const [loading, setLoading] = useState(false);

    // Card Form State
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [name, setName] = useState("");

    const RATE = 3; // 3 PKR per point
    const totalAmount = points * RATE;

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to buy points");
            return;
        }

        if (points < 1) {
            toast.error("Minimum 1 point required");
            return;
        }

        // internal validation
        if (cardNumber.length < 16) {
            toast.error("Invalid card number");
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL}/buy-points`, { // Route defined in payment.routes.js as /buy-points mounted at /api
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    points: points,
                    cardDetails: {
                        number: cardNumber,
                        expiry,
                        cvc,
                        name
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Successfully bought ${points} points!`);
                await refresh(); // Refresh user context to update points balance
                setLocation('/dashboard');
            } else {
                toast.error(data.error?.message || "Payment failed");
            }

        } catch (e) {
            toast.error("Network error processing payment");
        } finally {
            setLoading(false);
        }
    };

    // Formatters
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(val);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setExpiry(val);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Coins className="text-secondary" /> Buy Points
            </h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Amount</CardTitle>
                        <CardDescription>Rate: {RATE} PKR per Point</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="grid gap-2 flex-1">
                                <Label htmlFor="points">Points to Buy</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    min="1"
                                    value={points}
                                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="text-right">
                                <span className="block text-sm text-muted-foreground">Total Cost</span>
                                <span className="text-2xl font-bold text-accent">{totalAmount} PKR</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>Secure payment via Visa (Bank Account Integrated)</CardDescription>
                    </CardHeader>
                    <form onSubmit={handlePurchase}>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Cardholder Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="number">Card Number</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="number"
                                        className="pl-9"
                                        placeholder="0000 0000 0000 0000"
                                        required
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                                    <Input
                                        id="expiry"
                                        placeholder="MM/YY"
                                        required
                                        value={expiry}
                                        onChange={handleExpiryChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                    <Input
                                        id="cvc"
                                        placeholder="123"
                                        maxLength={3}
                                        required
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
                                Pay {totalAmount} PKR
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
