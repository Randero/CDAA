import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { blogPosts, featuredPost } from "@/data/blog";
import { blogCategoryLabels } from "@/types";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function Blog() {
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--lime)/0.08),transparent_50%)]" />
        <motion.div 
          className="container-custom relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary/20 to-lime/20 text-lime border-lime/30">Blog</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Cybersecurity <span className="text-lime">Insights</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stay updated with the latest in cybersecurity trends, threats, career advice, and best practices from our expert instructors.
          </p>
        </motion.div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link to={`/blog/${featuredPost.slug}`} className="block mb-12">
                <Card className="bg-card border-border overflow-hidden group hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10">
                  <div className="grid md:grid-cols-2">
                    <div className="relative overflow-hidden">
                      <img
                        src={featuredPost.thumbnail}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-accent to-cyber-orange text-accent-foreground shadow-lg">Featured</Badge>
                    </div>
                    <CardContent className="p-8 flex flex-col justify-center">
                      <Badge variant="outline" className="w-fit mb-4 border-lime/50 text-lime">
                        {blogCategoryLabels[featuredPost.category]}
                      </Badge>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4">
                        <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-accent/50 transition-all" />
                        <div>
                          <div className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{featuredPost.author.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {featuredPost.publishedAt} · <Clock className="w-3 h-3" /> {featuredPost.readTime}
                          </div>
                        </div>
                      </div>
                      <motion.div 
                        className="mt-4 flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        Read Article <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )}

          {/* Blog Grid */}
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {regularPosts.map((post) => (
              <motion.div key={post.id} variants={fadeInUp}>
                <Link to={`/blog/${post.slug}`}>
                  <Card className="bg-card border-border overflow-hidden group h-full hover:border-lime/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime/10">
                    <div className="relative overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-3 text-xs border-cyan/50 text-cyan">
                        {blogCategoryLabels[post.category]}
                      </Badge>
                      <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-lime transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.publishedAt}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
