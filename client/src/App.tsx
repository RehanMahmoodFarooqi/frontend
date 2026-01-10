import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import BrowseBooks from "./pages/BrowseBooks";
import BookDetail from "./pages/BookDetail";
import ListBook from "./pages/ListBook";
import MyProfile from "./pages/MyProfile";
import MyBooks from "./pages/MyBooks";
import Wishlist from "./pages/Wishlist";
import ExchangeHistory from "./pages/ExchangeHistory";
import Forums from "./pages/Forums";
import ForumDetail from "./pages/ForumDetail";
import Messages from "./pages/Messages";
import ExchangePoints from "./pages/ExchangePoints";
import BookHistory from "./pages/BookHistory";
import PointsMarketplace from "./pages/PointsMarketplace";
import Dashboard from "./pages/Dashboard";
import QRScanner from "./pages/QRScanner";
import BuyPoints from "./pages/BuyPoints";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/browse"} component={BrowseBooks} />
      <Route path={"/book/:id"} component={BookDetail} />
      <Route path={"/list-book"} component={ListBook} />
      <Route path={"/profile"} component={MyProfile} />
      <Route path={"/my-books"} component={MyBooks} />
      <Route path={"/wishlist"} component={Wishlist} />
      <Route path={"/exchange-history"} component={ExchangeHistory} />
      <Route path={"/forums"} component={Forums} />
      <Route path={"/forum/:id"} component={ForumDetail} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/exchange-points"} component={ExchangePoints} />
      <Route path={"/book/:id/history"} component={BookHistory} />
      <Route path={"/buy-points"} component={BuyPoints} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/scan-qr"} component={QRScanner} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col bg-background">
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
