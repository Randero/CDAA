import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin, Linkedin, Twitter, Youtube, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

const footerLinks = {
  courses: [
    { name: "Cybersecurity Fundamentals", href: "/courses" },
    { name: "Ethical Hacking", href: "/courses" },
    { name: "Cloud Security", href: "/courses" },
    { name: "SOC Analyst Training", href: "/courses" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/contact" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "Help Center", href: "/contact" },
    { name: "FAQs", href: "/contact" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-sky-400/40 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210 85% 40%), hsl(215 90% 35%), hsl(210 85% 40%))' }}>
      {/* Cyber watermark background */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'url(/images/cyber-footer-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="relative z-10 container-custom py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-3">
              <img src={logo} alt="Cyber Defend Africa Academy" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <span className="font-display font-extrabold text-lg text-white">Cyber Defend Africa</span>
                <span className="block text-xs font-semibold text-white/80">Academy</span>
              </div>
            </Link>
            <p className="text-white/90 font-medium mb-4 max-w-sm text-sm">
              Securing Africa's Digital Future through world-class cybersecurity training and education.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/20 rounded-lg text-white hover:text-white hover:bg-white/30 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-white/20 rounded-lg text-white hover:text-white hover:bg-white/30 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-white/20 rounded-lg text-white hover:text-white hover:bg-white/30 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-white/20 rounded-lg text-white hover:text-white hover:bg-white/30 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-extrabold text-black mb-3 text-sm uppercase tracking-wide">Courses</h4>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/90 hover:text-white font-medium transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-black mb-3 text-sm uppercase tracking-wide">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/90 hover:text-white font-medium transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-black mb-3 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-white/90 hover:text-white font-medium transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/90 text-sm font-semibold">
            © {new Date().getFullYear()} Cyber Defend Africa Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/90 font-semibold">
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
