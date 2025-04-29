
import { 
  Building2, 
  Calendar, 
  BookText, 
  Users, 
  UserPlus, 
  User,
  LayoutDashboard,
  Bell,
  Settings as SettingsIcon,
  Video,
  FileText,
  FileType,
  DollarSign,
  Scale,
  MessageSquare,
  UserSearch,
  Trophy,
  Lightbulb,
  Star
} from "lucide-react";
import { createBasicPage } from "@/components/common/createBasicPage";

// Mentorship Management Pages
export const FindMentorsAdmin = createBasicPage("Find Mentors", "Search and manage mentor profiles", UserSearch);
export const MentorSessionsAdmin = createBasicPage("Mentor Sessions", "Manage mentorship sessions", Calendar);
export const SuccessStoriesAdmin = createBasicPage("Success Stories", "Manage success stories and case studies", Trophy);
