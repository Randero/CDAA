import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Share2, Linkedin, Twitter, Facebook } from "lucide-react";
import { getPostBySlug, blogPosts } from "@/data/blog";
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

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug || "");
  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <Layout>
        <div className="container-custom section-padding text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
            <Button asChild className="bg-gradient-to-r from-primary to-cyan"><Link to="/blog">Back to Blog</Link></Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article>
        {/* Header */}
        <section className="bg-gradient-hero py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--cyan)/0.1),transparent_50%)]" />
          <motion.div 
            className="container-custom max-w-4xl relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-cyan mb-6 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Blog
            </Link>
            
            <Badge variant="outline" className="mb-4 border-lime/50 text-lime">{blogCategoryLabels[post.category]}</Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">{post.title}</h1>
            
            <div className="flex items-center gap-4">
              <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full ring-2 ring-cyan/30" />
              <div>
                <div className="font-medium text-foreground">{post.author.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-cyan" /> {post.publishedAt}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-accent" /> {post.readTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Featured Image */}
        <motion.div 
          className="container-custom max-w-4xl -mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img src={post.thumbnail} alt={post.title} className="w-full h-64 sm:h-96 object-cover rounded-xl shadow-2xl shadow-primary/10" />
        </motion.div>

        {/* Content */}
        <section className="section-padding">
          <motion.div 
            className="container-custom max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">{post.content}</div>
            </div>

            {/* Share */}
            <motion.div 
              className="mt-12 pt-8 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan" /> Share this article:
                </span>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan transition-all duration-300 hover:scale-110">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:border-accent/50 hover:bg-accent/10 hover:text-accent transition-all duration-300 hover:scale-110">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="hover:border-lime/50 hover:bg-lime/10 hover:text-lime transition-all duration-300 hover:scale-110">
                    <Facebook className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Related Posts */}
        <section className="section-padding bg-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--lime)/0.05),transparent_60%)]" />
          <div className="container-custom relative z-10">
            <motion.h2 
              className="font-display text-2xl font-bold text-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Related <span className="text-lime">Articles</span>
            </motion.h2>
            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {relatedPosts.map((relatedPost) => (
                <motion.div key={relatedPost.id} variants={fadeInUp}>
                  <Link to={`/blog/${relatedPost.slug}`}>
                    <Card className="bg-card border-border overflow-hidden group h-full hover:border-lime/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime/10">
                      <div className="relative overflow-hidden">
                        <img src={relatedPost.thumbnail} alt={relatedPost.title} className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-lime transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">{relatedPost.readTime}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </article>
    </Layout>
  );
}
