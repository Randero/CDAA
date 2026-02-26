import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, Eye, Heart, Users, Award, Globe, Linkedin, Twitter } from "lucide-react";
import { teamMembers, stats } from "@/data/team";
import { motion } from "framer-motion";

const values = [
  { icon: Award, title: "Excellence", description: "We deliver world-class training that meets international standards while addressing African contexts.", color: "cyan" },
  { icon: Users, title: "Accessibility", description: "Quality cybersecurity education should be available to everyone, regardless of background.", color: "accent" },
  { icon: Target, title: "Practical Skills", description: "Theory alone isn't enough. Our hands-on approach prepares you for real-world challenges.", color: "lime" },
  { icon: Heart, title: "Community", description: "We're building a network of African cybersecurity professionals who support each other.", color: "magenta" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
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

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--cyan)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_50%)]" />
        <motion.div 
          className="container-custom relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-cyan/20 text-cyan border-cyan/30">About Us</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Securing Africa's <span className="bg-gradient-to-r from-cyan to-accent bg-clip-text text-transparent">Digital Future</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Cyber Defend Africa Academy was founded with a singular mission: to bridge the cybersecurity skills gap 
            across the African continent and empower the next generation of security professionals.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Card className="bg-card border-border h-full group hover:border-cyan/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-cyan/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-cyan" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 group-hover:text-cyan transition-colors">Our Mission</h2>
                  <p className="text-muted-foreground">
                    To provide accessible, practical, and industry-relevant cybersecurity training that empowers 
                    individuals and organizations across Africa to protect their digital assets and thrive in the 
                    global digital economy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card className="bg-card border-border h-full group hover:border-accent/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-magenta/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors">Our Vision</h2>
                  <p className="text-muted-foreground">
                    To be Africa's leading cybersecurity academy, producing world-class security professionals who 
                    protect organizations locally and contribute to global cybersecurity excellence.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--lime)/0.05),transparent_60%)]" />
        <motion.div 
          className="container-custom relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our <span className="text-lime">Story</span></h2>
            <p className="text-muted-foreground mb-4">
              Africa's digital transformation is accelerating at an unprecedented pace. From mobile banking to 
              e-government, millions of Africans are coming online every year. But with this growth comes 
              increased exposure to cyber threats.
            </p>
            <p className="text-muted-foreground mb-4">
              We recognized a critical gap: while the demand for cybersecurity professionals was skyrocketing, 
              quality training programs tailored to African contexts were scarce. Most available certifications 
              were expensive, foreign, and didn't address the unique challenges facing African organizations.
            </p>
            <p className="text-muted-foreground">
              Cyber Defend Africa Academy was born to fill this gap. We combine international best practices 
              with deep understanding of African business environments, creating training that's both world-class 
              and locally relevant.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Our Core <span className="text-cyan">Values</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from course development to student support.
            </p>
          </motion.div>
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-card border-border text-center h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${value.color}/20 to-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <value.icon className={`w-6 h-6 text-${value.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-gradient-to-r from-primary/10 via-cyan/5 to-accent/10">
        <div className="container-custom">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center group cursor-default"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="font-display text-4xl font-bold bg-gradient-to-r from-primary via-cyan to-accent bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Meet Our <span className="text-accent">Team</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our leadership team brings decades of combined experience in cybersecurity and education.
            </p>
          </motion.div>
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {teamMembers.map((member) => (
              <motion.div key={member.id} variants={fadeInUp}>
                <Card className="bg-card border-border overflow-hidden group hover:border-accent/50 transition-all duration-300 h-full">
                  <div className="relative overflow-hidden">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors">{member.name}</h3>
                    <p className="text-sm text-cyan mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{member.bio}</p>
                    <div className="flex gap-2">
                      {member.linkedin && (
                        <a href={member.linkedin} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-cyan hover:bg-cyan/10 transition-all duration-300 hover:scale-110">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300 hover:scale-110">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
