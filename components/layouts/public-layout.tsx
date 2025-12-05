"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">
              CalexHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild className="shadow-md">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 pt-10">
                  <Link href="/" className="flex items-center gap-2 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Shield className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-primary">CalexHub</span>
                  </Link>
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-lg font-medium text-foreground hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button variant="outline" asChild className="w-full justify-center">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                    </Button>
                    <Button asChild className="w-full justify-center shadow-md">
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-bold">CalexHub</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs">
                Empowering the next generation of learners with controlled, high-quality digital education.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-amber-500">Platform</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/teachers" className="hover:text-white transition-colors">For Teachers</Link></li>
                <li><Link href="/business" className="hover:text-white transition-colors">For Business</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-amber-500">Company</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/legal" className="hover:text-white transition-colors">Legal</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-amber-500">Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} CalexHub. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-slate-300">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
