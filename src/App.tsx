import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { ProtectedRoute } from "./components/dashboard/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseEditor from "./pages/admin/AdminCourseEditor";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminLearningPaths from "./pages/admin/AdminLearningPaths";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminBlogPosts from "./pages/admin/AdminBlogPosts";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminPlatformSettings from "./pages/admin/AdminPlatformSettings";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminTranscripts from "./pages/admin/AdminTranscripts";
import AdminIDCards from "./pages/admin/AdminIDCards";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentPaths from "./pages/student/StudentPaths";
import StudentSettings from "./pages/student/StudentSettings";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentResources from "./pages/student/StudentResources";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentComplaints from "./pages/student/StudentComplaints";
import StudentTranscripts from "./pages/student/StudentTranscripts";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorCourseEditor from "./pages/instructor/InstructorCourseEditor";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import InstructorAnalytics from "./pages/instructor/InstructorAnalytics";
import InstructorSettings from "./pages/instructor/InstructorSettings";
import InstructorAssignments from "./pages/instructor/InstructorAssignments";
import InstructorResources from "./pages/instructor/InstructorResources";
import InstructorAnnouncements from "./pages/instructor/InstructorAnnouncements";
import InstructorQuizzes from "./pages/instructor/InstructorQuizzes";
import InstructorQuizEditor from "./pages/instructor/InstructorQuizEditor";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentQuizTake from "./pages/student/StudentQuizTake";
import StudentQuizResults from "./pages/student/StudentQuizResults";
import CourseLearning from "./pages/student/CourseLearning";
import StudentIDCard from "./pages/student/StudentIDCard";
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentCourses /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/resources" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentResources /></ProtectedRoute>} />
          <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentAnnouncements /></ProtectedRoute>} />
          <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentComplaints /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentCertificates /></ProtectedRoute>} />
          <Route path="/student/transcripts" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentTranscripts /></ProtectedRoute>} />
          <Route path="/student/paths" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentPaths /></ProtectedRoute>} />
          <Route path="/student/settings" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentSettings /></ProtectedRoute>} />
          <Route path="/student/quizzes" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentQuizzes /></ProtectedRoute>} />
          <Route path="/student/quizzes/:quizId" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentQuizTake /></ProtectedRoute>} />
          <Route path="/student/quizzes/:quizId/results/:attemptId" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentQuizResults /></ProtectedRoute>} />
          <Route path="/student/learn/:slug" element={<ProtectedRoute allowedRoles={["user", "student"]}><CourseLearning /></ProtectedRoute>} />
          <Route path="/student/id-card" element={<ProtectedRoute allowedRoles={["user", "student"]}><StudentIDCard /></ProtectedRoute>} />
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/courses" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorCourses /></ProtectedRoute>} />
          <Route path="/instructor/courses/new" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorCourseEditor /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id/edit" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorCourseEditor /></ProtectedRoute>} />
          <Route path="/instructor/assignments" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorAssignments /></ProtectedRoute>} />
          <Route path="/instructor/resources" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorResources /></ProtectedRoute>} />
          <Route path="/instructor/announcements" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorAnnouncements /></ProtectedRoute>} />
          <Route path="/instructor/students" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorStudents /></ProtectedRoute>} />
          <Route path="/instructor/analytics" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorAnalytics /></ProtectedRoute>} />
          <Route path="/instructor/settings" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorSettings /></ProtectedRoute>} />
          <Route path="/instructor/quizzes" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorQuizzes /></ProtectedRoute>} />
          <Route path="/instructor/quizzes/new" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorQuizEditor /></ProtectedRoute>} />
          <Route path="/instructor/quizzes/:id/edit" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorQuizEditor /></ProtectedRoute>} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/courses" element={<AdminProtectedRoute><AdminCourses /></AdminProtectedRoute>} />
          <Route path="/admin/courses/new" element={<AdminProtectedRoute><AdminCourseEditor /></AdminProtectedRoute>} />
          <Route path="/admin/courses/:id/edit" element={<AdminProtectedRoute><AdminCourseEditor /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
          <Route path="/admin/messages" element={<AdminProtectedRoute><AdminMessages /></AdminProtectedRoute>} />
          <Route path="/admin/testimonials" element={<AdminProtectedRoute><AdminTestimonials /></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
          <Route path="/admin/categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
          <Route path="/admin/learning-paths" element={<AdminProtectedRoute><AdminLearningPaths /></AdminProtectedRoute>} />
          <Route path="/admin/certificates" element={<AdminProtectedRoute><AdminCertificates /></AdminProtectedRoute>} />
          <Route path="/admin/blog" element={<AdminProtectedRoute><AdminBlogPosts /></AdminProtectedRoute>} />
          <Route path="/admin/blog/new" element={<AdminProtectedRoute><AdminBlogEditor /></AdminProtectedRoute>} />
          <Route path="/admin/blog/:id/edit" element={<AdminProtectedRoute><AdminBlogEditor /></AdminProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<AdminProtectedRoute><AdminAuditLogs /></AdminProtectedRoute>} />
          <Route path="/admin/platform-settings" element={<AdminProtectedRoute><AdminPlatformSettings /></AdminProtectedRoute>} />
          <Route path="/admin/payment-settings" element={<AdminProtectedRoute><AdminPaymentSettings /></AdminProtectedRoute>} />
          <Route path="/admin/coupons" element={<AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>} />
          <Route path="/admin/complaints" element={<AdminProtectedRoute><AdminComplaints /></AdminProtectedRoute>} />
          <Route path="/admin/transcripts" element={<AdminProtectedRoute><AdminTranscripts /></AdminProtectedRoute>} />
          <Route path="/admin/id-cards" element={<AdminProtectedRoute><AdminIDCards /></AdminProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;