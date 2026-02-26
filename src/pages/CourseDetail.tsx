import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Star, BookOpen, Award, CheckCircle, Play, FileText, HelpCircle, ArrowLeft, Loader2 } from "lucide-react";
import { categoryLabels, levelLabels, CourseCategory, CourseLevel } from "@/types";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { EnrollmentPaymentModal } from "@/components/enrollment/EnrollmentPaymentModal";
import { EnrollmentSuccessAnimation } from "@/components/enrollment/EnrollmentSuccessAnimation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const lessonIcons: Record<string, any> = { video: Play, quiz: HelpCircle, lab: BookOpen, reading: FileText };

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  thumbnail: string | null;
  price: number;
  original_price: number | null;
  duration: string | null;
  lessons_count: number | null;
  students_count: number | null;
  rating: number | null;
  level: string;
  category: string;
  instructor_name: string;
  instructor_title: string | null;
  instructor_avatar: string | null;
  is_published: boolean;
}

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch course from database
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["course-detail", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as CourseData | null;
    },
    enabled: !!slug,
  });

  // Fetch course objectives
  const { data: objectives = [] } = useQuery({
    queryKey: ["course-objectives", course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      const { data, error } = await supabase
        .from("course_objectives")
        .select("*")
        .eq("course_id", course.id)
        .order("sort_order");

      if (error) throw error;
      return data || [];
    },
    enabled: !!course?.id,
  });

  // Fetch course requirements
  const { data: requirements = [] } = useQuery({
    queryKey: ["course-requirements", course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      const { data, error } = await supabase
        .from("course_requirements")
        .select("*")
        .eq("course_id", course.id)
        .order("sort_order");

      if (error) throw error;
      return data || [];
    },
    enabled: !!course?.id,
  });

  // Fetch curriculum
  const { data: curriculum = [] } = useQuery({
    queryKey: ["course-curriculum", course?.id],
    queryFn: async () => {
      if (!course?.id) return [];
      const { data: sections, error } = await supabase
        .from("course_curriculum")
        .select(`
          *,
          curriculum_lessons(*)
        `)
        .eq("course_id", course.id)
        .order("sort_order");

      if (error) throw error;
      return sections || [];
    },
    enabled: !!course?.id,
  });

  useEffect(() => {
    checkUserAndEnrollment();
  }, [course?.id]);

  const checkUserAndEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user && course?.id) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single();

        setIsEnrolled(!!enrollment);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      toast.error("Please sign in to enroll");
      navigate("/auth");
      return;
    }

    if (!course) {
      toast.error("Course not available for enrollment");
      return;
    }

    setPaymentModalOpen(true);
  };

  const handleEnrollmentSuccess = () => {
    setPaymentModalOpen(false);
    setShowSuccess(true);
    setIsEnrolled(true);
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    navigate("/student");
  };

  if (courseLoading) {
    return (
      <Layout>
        <section className="bg-gradient-hero py-12 relative overflow-hidden">
          <div className="container-custom">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-20 w-full mb-6" />
              </div>
              <Card className="bg-card border-border">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-12 w-full mb-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container-custom section-padding text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course not found</h1>
          <Button asChild className="bg-gradient-to-r from-primary to-cyan"><Link to="/courses">Back to Courses</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--cyan)/0.1),transparent_50%)]" />
        <motion.div 
          className="container-custom relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/courses" className="inline-flex items-center text-muted-foreground hover:text-cyan mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Courses
          </Link>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="border-accent/50 text-accent">
                  {categoryLabels[course.category as CourseCategory]}
                </Badge>
                <Badge className="bg-gradient-to-r from-primary/20 to-cyan/20 text-cyan border-cyan/30">
                  {levelLabels[course.level as CourseLevel]}
                </Badge>
              </div>
              
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <img 
                    src={course.instructor_avatar || "/placeholder.svg"} 
                    alt={course.instructor_name} 
                    className="w-10 h-10 rounded-full ring-2 ring-cyan/30" 
                  />
                  <div>
                    <div className="text-foreground font-medium">{course.instructor_name}</div>
                    <div className="text-muted-foreground text-xs">{course.instructor_title || "Instructor"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4 text-accent fill-accent" /> {course.rating || 0} rating
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4 text-cyan" /> {(course.students_count || 0).toLocaleString()} students
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card border-border hover:border-cyan/50 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img 
                    src={course.thumbnail || "/placeholder.svg"} 
                    alt={course.title} 
                    className="w-full h-48 object-cover rounded-t-lg" 
                  />
                </div>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan to-accent bg-clip-text text-transparent mb-4">
                    {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                  </div>
                  
                  {checkingEnrollment ? (
                    <Button className="w-full mb-4" size="lg" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </Button>
                  ) : isEnrolled ? (
                    <Button 
                      className="w-full mb-4 bg-gradient-to-r from-green-600 to-emerald-500" 
                      size="lg"
                      onClick={() => navigate("/student/courses")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Go to My Courses
                    </Button>
                  ) : (
                    <Button 
                      className="w-full mb-4 bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90 shadow-lg shadow-primary/25 hover:shadow-cyan/30 hover:scale-105 transition-all duration-300" 
                      size="lg"
                      onClick={handleEnrollClick}
                    >
                      Enroll Now
                    </Button>
                  )}
                  <p className="text-center text-sm text-muted-foreground mb-6">14-day money-back guarantee</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-4 h-4 text-cyan" /> <span>{course.duration || "Self-paced"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <BookOpen className="w-4 h-4 text-accent" /> <span>{course.lessons_count || 0} lessons</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Award className="w-4 h-4 text-lime" /> <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              {objectives.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">What You'll <span className="text-lime">Learn</span></h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {objectives.map((obj, index) => (
                      <motion.div 
                        key={obj.id} 
                        className="flex gap-3 group"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CheckCircle className="w-5 h-5 text-lime shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{obj.objective}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Curriculum */}
              {curriculum.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">Course <span className="text-cyan">Curriculum</span></h2>
                  <Accordion type="single" collapsible className="space-y-3">
                    {curriculum.map((section: any, index: number) => (
                      <AccordionItem key={section.id} value={`section-${index}`} className="border border-border rounded-lg px-4 hover:border-cyan/30 transition-all duration-300">
                        <AccordionTrigger className="hover:no-underline group">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground group-hover:text-cyan transition-colors">{section.section_title}</span>
                            <Badge variant="outline" className="text-xs border-accent/50 text-accent">
                              {section.curriculum_lessons?.length || 0} lessons
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pb-2">
                            {section.curriculum_lessons?.map((lesson: any) => {
                              const Icon = lessonIcons[lesson.lesson_type] || Play;
                              return (
                                <div key={lesson.id} className="flex items-center justify-between py-2 text-sm group/lesson hover:bg-secondary/30 px-2 rounded transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 text-cyan" />
                                    <span className="text-muted-foreground group-hover/lesson:text-foreground transition-colors">{lesson.title}</span>
                                  </div>
                                  <span className="text-muted-foreground">{lesson.duration || ""}</span>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}

              {/* Requirements */}
              {requirements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">Requirements</h2>
                  <ul className="space-y-2">
                    {requirements.map((req) => (
                      <li key={req.id} className="flex items-start gap-3 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                        {req.requirement}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Instructor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card border-border sticky top-24 hover:border-accent/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">Your <span className="text-accent">Instructor</span></h3>
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={course.instructor_avatar || "/placeholder.svg"} 
                      alt={course.instructor_name} 
                      className="w-16 h-16 rounded-full ring-2 ring-accent/30 group-hover:ring-accent/50 transition-all" 
                    />
                    <div>
                      <div className="font-semibold text-foreground group-hover:text-accent transition-colors">{course.instructor_name}</div>
                      <div className="text-sm text-muted-foreground">{course.instructor_title || "Instructor"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {course && (
        <EnrollmentPaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          course={{
            id: course.id,
            title: course.title,
            price: course.price,
            original_price: course.original_price || undefined,
          }}
          onSuccess={handleEnrollmentSuccess}
        />
      )}

      {/* Success Animation */}
      <EnrollmentSuccessAnimation
        show={showSuccess}
        courseName={course.title}
        onContinue={handleSuccessContinue}
      />
    </Layout>
  );
}
