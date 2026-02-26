import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, BookOpen, Award, CheckCircle, Star, ArrowRight, Clock, ChevronRight, GraduationCap } from "lucide-react";
import { featuredCourses } from "@/data/courses";
import { testimonials } from "@/data/testimonials";
import { categoryLabels, levelLabels } from "@/types";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

const features = [
  { icon: Shield, title: "Industry-Relevant Training", description: "Courses designed with input from African cybersecurity leaders and aligned with international standards." },
  { icon: Users, title: "Expert African Instructors", description: "Learn from certified professionals who understand the unique challenges facing organizations across Africa." },
  { icon: BookOpen, title: "Hands-On Learning", description: "Practice in realistic lab environments with real-world scenarios and practical exercises." },
  { icon: Award, title: "Recognized Certifications", description: "Prepare for globally recognized certifications that advance your career anywhere in the world." },
];

const stats = [
  { value: 100, suffix: "+", label: "Students Trained" },
  { value: 15, suffix: "+", label: "Expert Courses" },
  { value: 15, suffix: "+", label: "African Countries" },
  { value: 95, suffix: "%", label: "Success Rate" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Index() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.1]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
          <img 
            src="/images/hero-bg.jpeg" 
            alt="Cybersecurity training environment" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
        
        {/* Main content */}
        <div className="container-custom relative z-10 py-20">
          <motion.div 
            className="max-w-3xl"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-primary/20 text-white border-primary/40 backdrop-blur-sm px-4 py-1.5">
                <Shield className="w-3 h-3 mr-2" /> Africa's Premier Cybersecurity Academy
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-[1.1] drop-shadow-lg"
              variants={fadeInUp}
            >
              Securing Africa's{" "}
              <span className="text-cyan">Digital Future</span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-white/80 mb-4 italic drop-shadow"
              variants={fadeInUp}
            >
              Train with the Best in the Industry
            </motion.p>
            
            <motion.p 
              className="text-base text-white/70 mb-10 max-w-2xl leading-relaxed"
              variants={fadeInUp}
            >
              Master cybersecurity with practical, industry-relevant training designed for Africa's digital economy. 
              Join thousands of professionals protecting organizations across the continent.
            </motion.p>
            
            <motion.div className="flex flex-wrap gap-4" variants={fadeInUp}>
              <Button 
                size="lg" 
                className="bg-destructive hover:bg-destructive/90 text-white gap-2 shadow-lg transition-all duration-300 hover:scale-105 px-8 h-14 text-base font-bold" 
                asChild
              >
                <Link to="/courses">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 px-8 h-14 text-base font-bold"
                asChild
              >
                <Link to="/courses">View Courses</Link>
              </Button>
            </motion.div>

            <motion.div 
              className="mt-14 flex flex-wrap gap-8"
              variants={fadeInUp}
            >
              {[
                { icon: Shield, label: "Hands-On Training" },
                { icon: Award, label: "Industry Certifications" },
                { icon: GraduationCap, label: "Career Advancement" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white drop-shadow">{item.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.p
              className="mt-12 text-lg font-bold text-white/90 drop-shadow-lg"
              variants={fadeInUp}
            >
              Empowering the Next Generation of Cyber Defenders
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-secondary/30 relative">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-cyan/10 text-cyan border-cyan/20">Why Choose Us</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-cyan">Cyber Defend Africa?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We're building the next generation of African cybersecurity professionals with training that matters.
            </p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="bg-card/50 border-border card-hover group cursor-pointer h-full backdrop-blur-sm hover:border-cyan/30">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-cyan/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:from-cyan/30 group-hover:to-primary/30 transition-all duration-300">
                      <feature.icon className="w-7 h-7 text-cyan group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-cyan transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-cyan/5 to-accent/5" />
        <div className="container-custom relative">
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
                className="text-center group p-6 rounded-2xl hover:bg-secondary/30 transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className="font-display text-5xl sm:text-6xl font-bold mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix}
                    className="text-cyan"
                  />
                </div>
                <div className="text-muted-foreground text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Popular Courses</Badge>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                Featured <span className="text-accent">Courses</span>
              </h2>
              <p className="text-muted-foreground text-lg">Start your cybersecurity journey with our most popular programs</p>
            </div>
            <Button variant="outline" className="hover:border-accent/50 hover:text-accent transition-all duration-300 group" asChild>
              <Link to="/courses">View All Courses <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {featuredCourses.slice(0, 6).map((course) => (
              <motion.div key={course.id} variants={fadeInUp}>
                <Link to={`/courses/${course.slug}`}>
                  <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full">
                    <div className="relative overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-sm">
                        {levelLabels[course.level]}
                      </Badge>
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" className="bg-cyan/90 hover:bg-cyan text-background">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-3 text-xs border-accent/50 text-accent">
                        {categoryLabels[course.category]}
                      </Badge>
                      <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.shortDescription}</p>
                      
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent fill-accent" /> {course.rating}
                          </span>
                        </div>
                        <span className="font-bold text-cyan text-lg">${course.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary/20">
        <div className="container-custom">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-lime/10 text-lime border-lime/20">Testimonials</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Success Stories from <span className="text-lime">Across Africa</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Hear from professionals who've transformed their careers with our training
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {testimonials.slice(0, 3).map((testimonial) => (
              <motion.div key={testimonial.id} variants={fadeInUp}>
                <Card className="bg-card/50 border-border hover:border-lime/30 transition-all duration-300 group h-full backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-accent group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }} />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-lime/50 transition-all" />
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-lime transition-colors">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.country}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="section-padding relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-cyan/10 to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--cyan)/0.15),transparent_60%)]" />
        
        <div className="container-custom text-center relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-cyan/10 text-cyan border-cyan/20">Get Started Today</Badge>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ready to <span className="text-shimmer">Secure Your Future?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of professionals advancing their cybersecurity careers with Cyber Defend Africa Academy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90 shadow-lg shadow-cyan/25 hover:shadow-cyan/40 hover:scale-105 transition-all duration-300 px-8 h-14 text-base" 
                asChild
              >
                <Link to="/courses">Browse Courses</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="hover:border-accent/50 hover:scale-105 transition-all duration-300 px-8 h-14 text-base" 
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
}
