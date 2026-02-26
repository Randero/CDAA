import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Star, Users, Filter } from "lucide-react";
import { categoryLabels, levelLabels, CourseCategory, CourseLevel } from "@/types";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categories = Object.entries(categoryLabels);
const levels = Object.entries(levelLabels);

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

export default function Courses() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "all">("all");

  // Fetch courses from database
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.short_description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-hero py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--cyan)/0.1),transparent_50%)]" />
        <motion.div 
          className="container-custom relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Explore Our <span className="text-cyan">Courses</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            From fundamentals to advanced techniques, find the perfect course to advance your cybersecurity career.
          </p>
        </motion.div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <motion.aside 
              className="lg:w-64 shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-cyan transition-colors" />
                  <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-secondary border-border focus:border-cyan/50 transition-all duration-300"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-cyan" /> Categories
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === "all" ? "secondary" : "ghost"}
                      size="sm"
                      className={`w-full justify-start transition-all duration-300 ${selectedCategory === "all" ? "bg-primary/20 text-cyan border-cyan/30" : "hover:bg-primary/10"}`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      All Categories
                    </Button>
                    {categories.map(([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedCategory === key ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full justify-start text-left transition-all duration-300 ${selectedCategory === key ? "bg-primary/20 text-cyan border-cyan/30" : "hover:bg-primary/10"}`}
                        onClick={() => setSelectedCategory(key as CourseCategory)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Levels */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Level</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedLevel === "all" ? "secondary" : "ghost"}
                      size="sm"
                      className={`w-full justify-start transition-all duration-300 ${selectedLevel === "all" ? "bg-accent/20 text-accent" : "hover:bg-accent/10"}`}
                      onClick={() => setSelectedLevel("all")}
                    >
                      All Levels
                    </Button>
                    {levels.map(([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedLevel === key ? "secondary" : "ghost"}
                        size="sm"
                        className={`w-full justify-start transition-all duration-300 ${selectedLevel === key ? "bg-accent/20 text-accent" : "hover:bg-accent/10"}`}
                        onClick={() => setSelectedLevel(key as CourseLevel)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Course Grid */}
            <div className="flex-1">
              <motion.div 
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-muted-foreground">
                  Showing <span className="text-cyan font-medium">{filteredCourses.length}</span> courses
                </p>
              </motion.div>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-card border-border overflow-hidden">
                      <Skeleton className="w-full h-44" />
                      <CardContent className="p-5">
                        <Skeleton className="h-4 w-20 mb-3" />
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex gap-3 mb-3">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                >
                  {filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={fadeInUp}
                      layout
                    >
                      <Link to={`/courses/${course.slug}`}>
                        <Card className="bg-card border-border overflow-hidden group h-full hover:border-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan/10">
                          <div className="relative overflow-hidden">
                            <img
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                              {levelLabels[course.level as CourseLevel]}
                            </Badge>
                          </div>
                          <CardContent className="p-5">
                            <Badge variant="outline" className="mb-3 text-xs border-accent/50 text-accent">
                              {categoryLabels[course.category as CourseCategory]}
                            </Badge>
                            <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-cyan transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {course.short_description || course.description}
                            </p>

                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {course.duration || "Self-paced"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" /> {(course.students_count || 0).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-accent fill-accent" />
                                <span className="font-medium text-foreground">{course.rating || 0}</span>
                              </div>
                              <span className="font-bold text-cyan text-lg">
                                {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!isLoading && filteredCourses.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-muted-foreground mb-4">No courses found matching your criteria.</p>
                  <Button 
                    variant="link" 
                    className="text-cyan hover:text-cyan/80"
                    onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedLevel("all"); }}
                  >
                    Clear filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
