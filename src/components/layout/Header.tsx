import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' })
            .then(({ data }) => setIsAdmin(data === true));
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' })
          .then(({ data }) => setIsAdmin(data === true));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="container-custom flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.img 
            src={logo} 
            alt="Cyber Defend Africa Academy" 
            className="h-16 w-16 rounded-full object-cover"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div className="hidden sm:block">
            <span className="font-display font-bold text-lg text-foreground group-hover:text-cyan transition-colors">Cyber Defend Africa</span>
            <span className="block text-xs text-muted-foreground">Academy</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                className={`relative text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "text-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
                {location.pathname === item.href && (
                  <motion.div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan to-primary"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {isAdmin && (
            <Button variant="ghost" size="sm" className="hover:text-cyan transition-colors" asChild>
              <Link to="/admin"><LayoutDashboard className="w-4 h-4 mr-2" />Admin</Link>
            </Button>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:text-cyan transition-colors">
              <LogOut className="w-4 h-4 mr-2" />Log Out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hover:text-cyan transition-colors" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90 shadow-lg shadow-primary/25 hover:shadow-cyan/30 hover:scale-105 transition-all duration-300" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <motion.button
          type="button"
          className="lg:hidden p-2 text-muted-foreground hover:text-cyan transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="lg:hidden bg-background/95 backdrop-blur-lg border-b border-border overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-custom py-4 space-y-4">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`block py-2 text-base font-medium transition-colors ${
                      location.pathname === item.href
                        ? "text-cyan"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                className="pt-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <Button variant="outline" className="w-full hover:border-cyan/50" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-primary to-cyan" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
