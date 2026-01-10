import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { BookOpen, Zap, MapPin, MessageSquare, QrCode, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Browse & Exchange",
      description: "Discover books from your community and exchange them using our fair point-based system.",
      color: "text-accent",
    },
    {
      icon: Zap,
      title: "Earn Points",
      description: "Get rewarded for listing books and sharing with others. Spend points to request books you want.",
      color: "text-secondary",
    },
    {
      icon: QrCode,
      title: "Book Journey",
      description: "Each book has a unique QR code tracking its reading history across multiple owners.",
      color: "text-tertiary",
    },
    {
      icon: MessageSquare,
      title: "Community Forums",
      description: "Join discussions, debate chapters, and share interpretations with fellow readers.",
      color: "text-accent",
    },
    {
      icon: MapPin,
      title: "Exchange Points",
      description: "Find physical meetup locations in your area to exchange books in person.",
      color: "text-secondary",
    },
    {
      icon: Users,
      title: "Connect Readers",
      description: "Build relationships with book lovers and expand your reading community.",
      color: "text-tertiary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="subtitle text-accent">Welcome to BooksExchange</p>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Share Stories, <span className="text-accent">Connect Readers</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-lg">
                Join a community-driven platform where book lovers exchange books fairly, track reading journeys, and build meaningful connections through shared literary experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link href="/browse">
                      <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-8">
                        Browse Books
                      </Button>
                    </Link>
                    <Link href="/list-book">
                      <Button variant="outline" className="rounded-full px-8 border-accent text-accent hover:bg-accent/10">
                        List Your Book
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <a href={getLoginUrl()}>
                      <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-8">
                        Get Started
                      </Button>
                    </a>
                    <a href={getLoginUrl()}>
                      <Button variant="outline" className="rounded-full px-8 border-accent text-accent hover:bg-accent/10">
                        Learn More
                      </Button>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Right decorative element */}
            <div className="relative h-96 hidden md:block">
              <div className="absolute inset-0 organic-blob bg-gradient-to-br from-accent/20 to-secondary/20 blur-3xl"></div>
              <div className="absolute top-12 right-12 w-32 h-32 organic-blob-2 bg-accent/30 blur-2xl"></div>
              <div className="absolute bottom-12 left-12 w-40 h-40 organic-blob-3 bg-secondary/20 blur-2xl"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-6xl">📚</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <p className="subtitle text-accent mb-2">Core Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-background to-white border border-border hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.color} mb-4 flex items-center justify-center bg-opacity-10`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Points Work */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="subtitle text-secondary mb-2">Fair Exchange System</p>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Earn & Spend Points</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-white border-2 border-secondary/30">
                <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold mb-4">+</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Earn Points</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>✓ List a book: 5 points</li>
                  <li>✓ Give a book: 10 points</li>
                  <li>✓ Contribute to book history: 2 points</li>
                  <li>✓ Forum participation: 1-3 points</li>
                </ul>
              </div>

              <div className="p-8 rounded-3xl bg-white border-2 border-accent/30">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold mb-4">-</div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Spend Points</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>✓ Request a book: 5-20 points</li>
                  <li>✓ Buy points: $1 = 10 points</li>
                  <li>✓ Fair pricing based on condition & demand</li>
                  <li>✓ No hidden fees</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Ready to Join?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start exchanging books with your community today. It takes just a few minutes to get started.
              </p>
              <a href={getLoginUrl()}>
                <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-6 text-lg">
                  Sign Up Now
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-foreground text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">BooksExchange</h4>
              <p className="text-sm text-white/70">Connecting readers through shared stories.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/browse">
                    <a className="hover:text-white transition">Browse Books</a>
                  </Link>
                </li>
                <li>
                  <Link href="/forums">
                    <a className="hover:text-white transition">Forums</a>
                  </Link>
                </li>
                <li>
                  <Link href="/exchange-points">
                    <a className="hover:text-white transition">Exchange Points</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/70">
            <p>&copy; 2024 BooksExchange. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
