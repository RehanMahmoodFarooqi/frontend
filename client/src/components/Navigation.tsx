import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { BookOpen, Home, LogOut, Menu, MessageSquare, Map, ShoppingBag, User, Zap } from "lucide-react";
import { Link } from "wouter";
import { LoginDialog } from "./LoginDialog";

export default function Navigation() {
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Browse", href: "/browse", icon: BookOpen },
    { label: "Forums", href: "/forums", icon: MessageSquare },
    { label: "Map", href: "/exchange-points", icon: Map },
  ];

  const userMenuItems = [
    { label: "Dashboard", href: "/dashboard", icon: User },
    { label: "My Books", href: "/my-books", icon: BookOpen },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Wishlist", href: "/wishlist", icon: ShoppingBag },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Buy Points", href: "/buy-points", icon: Zap },
  ];

  return (
    <nav className="sticky top-4 z-50 px-4 mb-8">
      <div className="container mx-auto max-w-6xl">
        <div className="glass rounded-2xl flex items-center justify-between px-6 py-3 shadow-lg/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 organic-blob bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center rounded-2xl shadow-md">
              <span className="text-xl">📚</span>
            </div>
            <span className="hidden sm:inline font-outfit tracking-tight">BooksExchange</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-full border border-white/10">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-white text-muted-foreground hover:text-foreground transition-all">
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right side - Auth and User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Points Display */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-tertiary/20 to-accent/10 rounded-full border border-accent/20">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-foreground">
                    {(user as any)?.stats?.currentPoints ?? 0} pts
                  </span>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 border border-white/20 hover:bg-white/50">
                      <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-white/20">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border/50" />
                    {userMenuItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem className="cursor-pointer focus:bg-primary/10">
                          <item.icon className="w-4 h-4 mr-2 text-primary" />
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <LoginDialog />
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 glass border-l-white/20">
                <div className="flex flex-col gap-6 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">B</div>
                    <span className="font-bold text-lg">Menu</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button variant="ghost" className="w-full justify-start text-base">
                          <item.icon className="w-5 h-5 mr-3 text-muted-foreground" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 px-4">Account</h4>
                    <div className="flex flex-col gap-1">
                      {userMenuItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
