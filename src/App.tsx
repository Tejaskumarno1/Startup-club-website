
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import JoinClub from "./pages/JoinClub";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AuthPage from "./pages/auth/AuthPage";
import AuthCallback from "./pages/auth/Callback";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Startups
import Startups from "./pages/startups/Startups";
import BrowseStartups from "./pages/startups/BrowseStartups";
import MyConnections from "./pages/startups/MyConnections";
import RequestIntroductions from "./pages/startups/RequestIntroductions";

// Events
import Events from "./pages/events/Events";
import UpcomingEvents from "./pages/events/UpcomingEvents";
import MyCalendar from "./pages/events/MyCalendar";
import PastRecordings from "./pages/events/PastRecordings";

// Community
import Community from "./pages/community/Community";
import MemberDirectory from "./pages/community/MemberDirectory";
import SuccessStories from "./pages/community/SuccessStories";
import ConnectionRequests from "./pages/community/ConnectionRequests";

// Mentorship
import Mentorship from "./pages/mentorship/Mentorship";
import FindMentor from "./pages/mentorship/FindMentor";
import MentorSessions from "./pages/mentorship/MentorSessions";
import BecomeMentor from "./pages/mentorship/BecomeMentor";
import MentorDetail from "./pages/mentorship/MentorDetail";

// Profile
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Notifications from "./pages/profile/Notifications";
import Settings from "./pages/profile/Settings";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageStartups from "./pages/admin/ManageStartups";
import ManageMentors from "./pages/admin/ManageMentors";
import ManageMentorshipProgram from "./pages/admin/ManageMentorshipProgram";
import ManageSlides from "./pages/admin/ManageSlides";
import ManageSponsors from "./pages/admin/ManageSponsors";
import ManageRecordings from "./pages/admin/ManageRecordings";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminDirectory from "./pages/admin/AdminDirectory";
import AdminBrowseStartups from "./pages/admin/AdminBrowseStartups";
import AdminIntroductions from "./pages/admin/AdminIntroductions";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminSuccessStories from "./pages/admin/AdminSuccessStories";
import ManageImportantMembers from "./pages/admin/ManageImportantMembers";
import ManageSuccessStories from "./pages/admin/ManageSuccessStories";
import SiteConfigPage from "./pages/admin/SiteConfigPage";
import ManageEventRegistrations from "./pages/admin/ManageEventRegistrations";

// Chat
import Chat from "./pages/chat/Chat";

// Import only the Find Mentors and Mentor Sessions admin pages
import { 
  FindMentorsAdmin,
  MentorSessionsAdmin,
  SuccessStoriesAdmin
} from "./pages/createRemainingPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/login" element={<AuthPage />} /> {/* Updated to use new AuthPage */}
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/signup" element={<AuthPage />} /> {/* Added alternative signup path */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Startups */}
            <Route path="/startups" element={<Startups />} />
            <Route path="/startups/browse" element={<BrowseStartups />} />
            <Route path="/startups/connections" element={<MyConnections />} />
            <Route path="/startups/introductions" element={<RequestIntroductions />} />
            
            {/* Events */}
            <Route path="/events" element={<Events />} />
            <Route path="/events/upcoming" element={<UpcomingEvents />} />
            <Route path="/events/calendar" element={<MyCalendar />} />
            <Route path="/events/recordings" element={<PastRecordings />} />
            
            {/* Community */}
            <Route path="/community" element={<Community />} />
            <Route path="/community/directory" element={<MemberDirectory />} />
            <Route path="/community/success-stories" element={<SuccessStories />} />
            <Route path="/community/connection-requests" element={<ConnectionRequests />} />
            
            {/* Mentorship */}
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/mentorship/find" element={<FindMentor />} />
            <Route path="/mentorship/mentor/:mentorId" element={<MentorDetail />} />
            <Route path="/mentorship/sessions" element={<MentorSessions />} />
            <Route path="/mentorship/become" element={<BecomeMentor />} />
            
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/notifications" element={<Notifications />} />
            <Route path="/profile/settings" element={<Settings />} />
            
            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/events" element={<ManageEvents />} />
            <Route path="/admin/event-registrations" element={<ManageEventRegistrations />} />
            <Route path="/admin/startups" element={<ManageStartups />} />
            <Route path="/admin/mentors" element={<ManageMentors />} />
            <Route path="/admin/mentorship" element={<ManageMentorshipProgram />} />
            <Route path="/admin/slides" element={<ManageSlides />} />
            <Route path="/admin/sponsors" element={<ManageSponsors />} />
            <Route path="/admin/recordings" element={<ManageRecordings />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/site-config" element={<SiteConfigPage />} />
            <Route path="/admin/directory" element={<AdminDirectory />} />
            <Route path="/admin/browse-startups" element={<AdminBrowseStartups />} />
            <Route path="/admin/introductions" element={<AdminIntroductions />} />
            <Route path="/admin/calendar" element={<AdminCalendar />} />
            <Route path="/admin/success-stories" element={<AdminSuccessStories />} />
            <Route path="/admin/manage-important-members" element={<ManageImportantMembers />} />
            <Route path="/admin/manage-success-stories" element={<ManageSuccessStories />} />
            
            {/* New Admin Routes - Mentorship Management */}
            <Route path="/admin/find-mentors" element={<FindMentorsAdmin />} />
            <Route path="/admin/mentor-sessions" element={<MentorSessionsAdmin />} />
            <Route path="/admin/success-stories" element={<SuccessStoriesAdmin />} />
            
            {/* Chat */}
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:roomId" element={<Chat />} />
            
            {/* Other Pages */}
            <Route path="/join" element={<JoinClub />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
