import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Home, Users, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-nairobi.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/50" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Affordable Home
              </span>
              {" "}in Nairobi
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect directly with property caretakers. Browse verified listings, 
              compare prices, and find your ideal place to call home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg">
                <Link to="/listings">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Properties
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link to="/auth?mode=signup&role=caretaker">
                  List Your Property
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose HomeConnect?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-muted-foreground">
                All properties are verified with real photos and accurate information
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Connection</h3>
              <p className="text-muted-foreground">
                Message caretakers directly without middlemen or extra fees
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Transparent</h3>
              <p className="text-muted-foreground">
                Clear pricing, secure platform, and trusted community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Home?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Nairobi residents finding affordable housing
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth?mode=signup">
              Get Started Free
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 HomeConnect Nairobi. Connecting communities, one home at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
