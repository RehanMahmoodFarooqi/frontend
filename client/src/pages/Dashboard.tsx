import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, BookOpen, Repeat, Star, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      // Fetch User Profile with stats (users.service getProfile returns stats)
      const res = await fetch(`${API_URL}/users/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-subtle-gradient pb-20 overflow-hidden relative">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 pt-8">
        {/* Header */}
        <header className="mb-12 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Hello, <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{user?.name}</span>! 👋
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed">
            Your personal exchange hub. Track your impact, manage your library, and discover new stories.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[{
            title: "Total Points",
            value: stats?.currentPoints || 0,
            sub: "Available to spend",
            icon: Coins,
            color: "text-primary",
            bg: "bg-primary/10"
          }, {
            title: "Active Listings",
            value: stats?.totalBooksListed || 0,
            sub: "Books available",
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-100"
          }, {
            title: "Exchanges",
            value: stats?.totalBooksExchanged || 0,
            sub: "Completed trades",
            icon: Repeat,
            color: "text-green-600",
            bg: "bg-green-100"
          }, {
            title: "Reputation",
            value: (stats?.averageRating || 0).toFixed(1),
            sub: "Average rating",
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-100"
          }].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-white/20 rounded-bl-full transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-bold font-outfit text-foreground mb-1">{stat.value}</div>
                <p className="text-sm font-medium text-muted-foreground">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Layout: Quick Actions vs Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - Col Span 1 */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold px-1">Quick Actions</h2>
            <div className="grid gap-4">
              <Link href="/list-book">
                <div className="glass p-4 rounded-xl flex items-center gap-4 hover:bg-white/90 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary hover:shadow-md">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">List a Book</h3>
                    <p className="text-xs text-muted-foreground">Share a book & earn points</p>
                  </div>
                </div>
              </Link>
              <Link href="/browse">
                <div className="glass p-4 rounded-xl flex items-center gap-4 hover:bg-white/90 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-accent hover:shadow-md">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Repeat className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Find a Book</h3>
                    <p className="text-xs text-muted-foreground">Browse 100+ available titles</p>
                  </div>
                </div>
              </Link>
              <Link href="/buy-points">
                <div className="glass p-4 rounded-xl flex items-center gap-4 hover:bg-white/90 transition-all cursor-pointer group border-l-4 border-l-transparent hover:border-l-green-500 hover:shadow-md">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Top Up Points</h3>
                    <p className="text-xs text-muted-foreground">Get more credits instantly</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Activity/History - Col Span 2 */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-[2rem] p-8 h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                  <p className="text-sm text-muted-foreground">Your latest transactions and movements</p>
                </div>
                <Link href="/exchange-history">
                  <Button variant="outline" size="sm" className="rounded-full">View Full History</Button>
                </Link>
              </div>

              {/* Activity Feed Placeholder with nice illustration */}
              <div className="flex flex-col items-center justify-center h-64 text-center bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-secondary/10">
                  <Repeat className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">No recent activity</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Your timeline is looking a bit empty. Start by listing a book or browsing for a new read!
                </p>
                <div className="mt-6">
                  <Link href="/browse">
                    <Button>Start Exploring</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
