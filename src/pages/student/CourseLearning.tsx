import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  FileText,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const lessonIcons: Record<string, any> = {
  video: Play,
  quiz: HelpCircle,
  lab: BookOpen,
  reading: FileText,
};

export default function CourseLearning() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useUserRole();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Fetch course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["learning-course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Check enrollment
  const { data: enrollment } = useQuery({
    queryKey: ["learning-enrollment", user?.id, course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", course!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!course?.id,
  });

  // Fetch curriculum with lessons
  const { data: curriculum = [] } = useQuery({
    queryKey: ["learning-curriculum", course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_curriculum")
        .select(`*, curriculum_lessons(*)`)
        .eq("course_id", course!.id)
        .order("sort_order");
      if (error) throw error;
      // Sort lessons within each section
      return (data || []).map((section: any) => ({
        ...section,
        curriculum_lessons: (section.curriculum_lessons || []).sort(
          (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
        ),
      }));
    },
    enabled: !!course?.id,
  });

  // Fetch lesson progress
  const { data: progressData = [] } = useQuery({
    queryKey: ["lesson-progress", user?.id, course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("course_id", course!.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!course?.id,
  });

  const completedLessonIds = useMemo(
    () => new Set(progressData.filter((p) => p.completed).map((p) => p.lesson_id)),
    [progressData]
  );

  const allLessons = useMemo(
    () => curriculum.flatMap((s: any) => s.curriculum_lessons || []),
    [curriculum]
  );

  const overallProgress = allLessons.length
    ? Math.round((completedLessonIds.size / allLessons.length) * 100)
    : 0;

  const activeLesson = useMemo(
    () => allLessons.find((l: any) => l.id === activeLessonId),
    [allLessons, activeLessonId]
  );

  // Set first incomplete lesson as active on load
  useEffect(() => {
    if (allLessons.length && !activeLessonId) {
      const firstIncomplete = allLessons.find((l: any) => !completedLessonIds.has(l.id));
      setActiveLessonId(firstIncomplete?.id || allLessons[0]?.id);
      // Expand the section containing the active lesson
      if (firstIncomplete || allLessons[0]) {
        const targetId = firstIncomplete?.id || allLessons[0]?.id;
        const section = curriculum.find((s: any) =>
          s.curriculum_lessons?.some((l: any) => l.id === targetId)
        );
        if (section) setExpandedSections(new Set([section.id]));
      }
    }
  }, [allLessons, activeLessonId, completedLessonIds, curriculum]);

  // Toggle lesson completion
  const toggleCompletion = useMutation({
    mutationFn: async (lessonId: string) => {
      const isCompleted = completedLessonIds.has(lessonId);
      if (isCompleted) {
        await supabase
          .from("lesson_progress")
          .delete()
          .eq("user_id", user!.id)
          .eq("lesson_id", lessonId);
      } else {
        await supabase.from("lesson_progress").upsert({
          user_id: user!.id,
          lesson_id: lessonId,
          course_id: course!.id,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_id" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", user?.id, course?.id] });
    },
    onError: () => toast.error("Failed to update progress"),
  });

  // Navigate to next lesson
  const goToNextLesson = () => {
    const currentIdx = allLessons.findIndex((l: any) => l.id === activeLessonId);
    if (currentIdx < allLessons.length - 1) {
      const next = allLessons[currentIdx + 1];
      setActiveLessonId(next.id);
      // Expand the section containing next lesson
      const section = curriculum.find((s: any) =>
        s.curriculum_lessons?.some((l: any) => l.id === next.id)
      );
      if (section) setExpandedSections((prev) => new Set([...prev, section.id]));
    }
  };

  const goToPrevLesson = () => {
    const currentIdx = allLessons.findIndex((l: any) => l.id === activeLessonId);
    if (currentIdx > 0) {
      const prev = allLessons[currentIdx - 1];
      setActiveLessonId(prev.id);
      const section = curriculum.find((s: any) =>
        s.curriculum_lessons?.some((l: any) => l.id === prev.id)
      );
      if (section) setExpandedSections((prev) => new Set([...prev, section.id]));
    }
  };

  const currentLessonIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

  // Redirect if not enrolled
  useEffect(() => {
    if (enrollment === null && !courseLoading && course) {
      toast.error("You are not enrolled in this course");
      navigate(`/courses/${slug}`);
    }
  }, [enrollment, courseLoading, course, slug, navigate]);

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-80 border-r border-border p-4 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="w-full aspect-video" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course not found</h1>
          <Button asChild>
            <Link to="/student/courses">Back to My Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate("/student/courses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{course.title}</h1>
          <div className="flex items-center gap-2">
            <Progress value={overallProgress} className="h-1.5 w-32" />
            <span className="text-xs text-muted-foreground">{overallProgress}% complete</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border bg-card shrink-0 overflow-hidden"
            >
              <ScrollArea className="h-[calc(100vh-3.5rem)]">
                <div className="p-4 space-y-1">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Course Content
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    {completedLessonIds.size} of {allLessons.length} lessons completed
                  </p>

                  {curriculum.map((section: any) => {
                    const isExpanded = expandedSections.has(section.id);
                    const sectionLessons = section.curriculum_lessons || [];
                    const sectionCompleted = sectionLessons.filter((l: any) =>
                      completedLessonIds.has(l.id)
                    ).length;

                    return (
                      <div key={section.id} className="mb-1">
                        <button
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                          onClick={() =>
                            setExpandedSections((prev) => {
                              const next = new Set(prev);
                              if (next.has(section.id)) next.delete(section.id);
                              else next.add(section.id);
                              return next;
                            })
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-sm font-medium text-foreground truncate">
                              {section.section_title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {sectionCompleted}/{sectionLessons.length}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              {sectionLessons.map((lesson: any) => {
                                const Icon = lessonIcons[lesson.lesson_type] || Play;
                                const isActive = lesson.id === activeLessonId;
                                const isCompleted = completedLessonIds.has(lesson.id);

                                return (
                                  <button
                                    key={lesson.id}
                                    onClick={() => setActiveLessonId(lesson.id)}
                                    className={cn(
                                      "w-full flex items-center gap-3 py-2 px-3 pl-10 rounded-md text-left transition-colors text-sm",
                                      isActive
                                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                                        : "hover:bg-secondary/30 text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                    ) : (
                                      <Icon className="h-4 w-4 shrink-0" />
                                    )}
                                    <span className="truncate flex-1">{lesson.title}</span>
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {lesson.duration}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              {/* Video Player */}
              {activeLesson.video_url && (
                <div className="aspect-video rounded-xl overflow-hidden bg-black border border-border">
                  <iframe
                    src={getVideoEmbedUrl(activeLesson.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeLesson.title}
                  />
                </div>
              )}

              {/* Lesson Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {activeLesson.lesson_type || "lesson"}
                    </Badge>
                    {activeLesson.duration && (
                      <span className="text-xs text-muted-foreground">{activeLesson.duration}</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground">
                    {activeLesson.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox
                    id="mark-complete"
                    checked={completedLessonIds.has(activeLesson.id)}
                    onCheckedChange={() => toggleCompletion.mutate(activeLesson.id)}
                  />
                  <label htmlFor="mark-complete" className="text-sm text-muted-foreground cursor-pointer">
                    Mark as complete
                  </label>
                </div>
              </div>

              {/* Text Content */}
              {activeLesson.content && (
                <div className="prose prose-invert max-w-none bg-card rounded-xl p-6 border border-border">
                  <div
                    className="text-foreground leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                  />
                </div>
              )}

              {/* No content placeholder */}
              {!activeLesson.video_url && !activeLesson.content && (
                <div className="bg-card rounded-xl p-12 border border-border text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Content coming soon
                  </h3>
                  <p className="text-muted-foreground">
                    Your instructor is preparing this lesson. Check back later!
                  </p>
                </div>
              )}

              {/* Quiz link */}
              {activeLesson.lesson_type === "quiz" && (
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <HelpCircle className="h-6 w-6 text-cyan" />
                    <h3 className="text-lg font-semibold text-foreground">Quiz Available</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Test your knowledge on this topic by taking the quiz.
                  </p>
                  <Button asChild>
                    <Link to="/student/quizzes">Go to Quizzes</Link>
                  </Button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={goToPrevLesson}
                  disabled={currentLessonIndex <= 0}
                >
                  ← Previous Lesson
                </Button>
                {currentLessonIndex < allLessons.length - 1 ? (
                  <Button onClick={goToNextLesson}>Next Lesson →</Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-primary to-cyan"
                    onClick={() => {
                      toast.success("Congratulations! You've completed all lessons!");
                      navigate("/student/courses");
                    }}
                  >
                    Finish Course
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a lesson to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
