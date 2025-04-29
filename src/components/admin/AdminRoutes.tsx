
import { lazy } from 'react';
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageEvents from "@/pages/admin/ManageEvents";
import ManageMentors from "@/pages/admin/ManageMentors";
import ManageSlides from "@/pages/admin/ManageSlides";
import ManageImportantMembers from "@/pages/admin/ManageImportantMembers";
import SystemSettings from "@/pages/admin/SystemSettings";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import ManageSuccessStories from "@/pages/admin/ManageSuccessStories";
import ManageStartups from "@/pages/admin/ManageStartups";
import AdminCalendar from "@/pages/admin/AdminCalendar";
import ManageRecordings from "@/pages/admin/ManageRecordings";
import ManageEventRegistrations from "@/pages/admin/ManageEventRegistrations";

const SiteConfigPage = lazy(() => import('@/pages/admin/SiteConfigPage'));

const adminRoutes = [
  {
    path: '/admin',
    component: AdminDashboard,
  },
  {
    path: '/admin/analytics',
    component: AdminAnalytics,
  },
  {
    path: '/admin/users',
    component: ManageUsers,
  },
  {
    path: '/admin/events',
    component: ManageEvents,
  },
  {
    path: '/admin/event-registrations',
    component: ManageEventRegistrations,
  },
  {
    path: '/admin/calendar',
    component: AdminCalendar,
  },
  {
    path: '/admin/recordings',
    component: ManageRecordings,
  },
  {
    path: '/admin/mentors',
    component: ManageMentors,
  },
  {
    path: '/admin/slides',
    component: ManageSlides,
  },
  {
    path: '/admin/manage-important-members',
    component: ManageImportantMembers,
  },
  {
    path: '/admin/settings',
    component: SystemSettings,
  },
  {
    path: '/admin/manage-success-stories',
    component: ManageSuccessStories,
  },
  {
    path: '/admin/manage-startups',
    component: ManageStartups,
  },
  {
    path: '/admin/site-config',
    component: SiteConfigPage,
  },
];

export default adminRoutes;
