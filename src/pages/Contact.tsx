import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { faqs } from "@/data/team";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const contactCards = [
  { icon: Mail, title: "Email Us", lines: ["info@cyberdefendafrica.com", "support@cyberdefendafrica.com"], color: "cyan" },
  { icon: Phone, title: "Call Us", lines: ["+234 800 123 4567", "Mon-Fri, 9am-5pm WAT"], color: "accent" },
  { icon: MapPin, title: "Visit Us", lines: ["Victoria Island, Lagos, Nigeria", "(By appointment only)"], color: "lime" },
];

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--cyan)/0.1),transparent_50%)]" />
        <motion.div 
          className="container-custom relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-cyan/20 text-cyan border-cyan/30">Contact Us</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Get in <span className="text-cyan">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Have questions about our courses or need help choosing the right program? We're here to help.
          </p>
        </motion.div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-card border-border hover:border-cyan/30 transition-all duration-300">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send us a <span className="text-cyan">message</span></h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                        <Input placeholder="Abubakar" className="bg-secondary border-border focus:border-cyan/50 transition-all duration-300" required />
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                        <Input type="email" placeholder="abubakar@example.com" className="bg-secondary border-border focus:border-cyan/50 transition-all duration-300" required />
                      </motion.div>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                      <Input placeholder="How can we help?" className="bg-secondary border-border focus:border-cyan/50 transition-all duration-300" required />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                      <Textarea placeholder="Tell us more about your inquiry..." className="bg-secondary border-border min-h-[150px] focus:border-cyan/50 transition-all duration-300" required />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button type="submit" size="lg" className="bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90 shadow-lg shadow-primary/25 hover:shadow-cyan/30 hover:scale-105 transition-all duration-300">
                        <Send className="w-4 h-4 mr-2" /> Send Message
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              className="space-y-6"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              {contactCards.map((card, index) => (
                <motion.div key={card.title} variants={fadeInUp}>
                  <Card className={`bg-card border-border group hover:border-${card.color}/50 transition-all duration-300 hover:shadow-lg hover:shadow-${card.color}/10`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${card.color}/20 to-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <card.icon className={`w-5 h-5 text-${card.color}`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-foreground mb-1 group-hover:text-${card.color} transition-colors`}>{card.title}</h3>
                          {card.lines.map((line, i) => (
                            <p key={i} className="text-muted-foreground text-sm">{line}</p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.05),transparent_60%)]" />
        <div className="container-custom relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <MessageSquare className="w-10 h-10 text-accent mx-auto mb-4" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Frequently Asked <span className="text-accent">Questions</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our courses, certifications, and enrollment process.
            </p>
          </motion.div>

          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem value={`faq-${index}`} className="border border-border rounded-lg px-4 bg-card hover:border-accent/30 transition-all duration-300">
                    <AccordionTrigger className="hover:no-underline text-left group">
                      <span className="font-medium text-foreground group-hover:text-accent transition-colors">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground pb-2">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
