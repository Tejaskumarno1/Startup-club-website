export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start_datetime: string;
    end_datetime: string;
    location_type: 'virtual' | 'physical' | 'hybrid';
    physical_address?: string;
    virtual_meeting_url?: string;
    event_type: string;
    is_public: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    attendees_count?: number;
    image_url?: string;
    highlights?: string[];
    is_registered?: boolean;
  }
  
  export interface PastRecording {
    id: string;
    event_id: string;
    title: string;
    description?: string;
    recording_url: string;
    thumbnail_url?: string;
    presenter_name?: string;
    duration?: number;
    recorded_at: string;
    is_public: boolean;
    view_count?: number;
    created_at?: string;
    updated_at?: string;
    events?: {
      title: string;
      start_datetime: string;
    };
    event_type?: string;
  }
  
  export interface EventRegistration {
    id: string;
    event_id: string;
    user_id: string;
    status: 'registered' | 'canceled' | 'attended' | 'no-show';
    registered_at: string;
    role: string;
    user_company?: string;
  }
  
  export interface UserProfile {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    photo_url?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
    company?: string;
    profession?: string;
    location?: string;
  }
  
  export interface UserSettings {
    id: string;
    user_id: string;
    theme_preference: 'light' | 'dark' | 'system';
    notification_preferences: {
      email: boolean;
      push: boolean;
      site: boolean;
      [key: string]: boolean;
    };
    privacy_settings: {
      profile_visibility: 'public' | 'members' | 'private';
      [key: string]: any;
    };
    created_at?: string;
    updated_at?: string;
  }
  
  export interface SlideImage {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
    company?: string;
    profession?: string;
    location?: string;
    bio?: string;
    industry?: string;
    interests?: string[];
    settings?: UserSettings;
    username?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
    language?: string;
    social_links?: any;
    profile_image_url?: string;
    connections_count?: number;
    joined_events_count?: number;
  }
  
  export interface SuccessStory {
    id: string;
    user_id: string;
    company_name: string;
    founder: string;
    description: string;
    achievements?: string[];
    industry?: string;
    year?: number;
    featured?: boolean;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ImportantMember {
    id: string;
    name: string;
    role: string;
    bio?: string;
    avatar_url?: string;
    company?: string;
    expertise?: string[];
    linkedin_url?: string;
    twitter_url?: string;
    website_url?: string;
    instagram_url?: string;
    is_active?: boolean;
    display_order: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface IntroductionRequest {
    id: string;
    requester_id: string;
    intermediary_id: string;
    target_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    message?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ForumCategory {
    id: string;
    name: string;
    description?: string;
    order_num?: number;
    created_at: string;
  }
  
  export interface ForumTopic {
    id: string;
    category_id: string;
    user_id: string;
    title: string;
    content: string;
    view_count?: number;
    is_pinned?: boolean;
    is_locked?: boolean;
    created_at: string;
    updated_at: string;
    replies_count?: number;
  }
  
  export interface ForumReply {
    id: string;
    topic_id: string;
    user_id: string;
    content: string;
    is_accepted?: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface MentorProfile {
    id: string;
    user_id: string;
    bio?: string;
    expertise?: string[];
    availability?: string;
    is_approved?: boolean;
    hourly_rate?: number;
    created_at: string;
    updated_at: string;
    industry?: string;
    experience?: string;
    profiles?: {
      first_name: string;
      last_name: string;
      profession: string;
      company: string;
      profile_image_url: string;
    };
  }
  
  export interface MentorSession {
    id: string;
    mentor_id: string;
    mentee_id: string;
    topic: string;
    description?: string;
    scheduled_at: string;
    duration: number;
    status: 'scheduled' | 'completed' | 'canceled';
    meeting_link?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface ResourceCategory {
    id: string;
    name: string;
    description?: string;
    type: string;
    created_at: string;
  }
  
  export interface Resource {
    id: string;
    title: string;
    description?: string;
    content?: string;
    attachment_url?: string;
    view_count?: number;
    is_premium?: boolean;
    created_by?: string;
    created_at: string;
    updated_at: string;
    category_id: string;
  }
  
  export interface Startup {
    id: string;
    name: string;
    description?: string;
    logo_url?: string;
    website_url?: string;
    industry?: string;
    team_size?: number;
    funding_stage?: string;
    founding_date?: string;
    founder_id: string;
    is_featured?: boolean;
    created_at: string;
    updated_at: string;
    linkedin_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    github_url?: string;
  }
  
  export interface StartupMember {
    id: string;
    startup_id: string;
    user_id: string;
    role?: string;
    joined_at: string;
  }
  
  export interface StartupWithFounder extends Startup {
    founder: User;
  }
  
  export interface Connection {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
  }
  
  export interface Notification {
    id: string;
    user_id: string;
    content: string;
    notification_type: string;
    is_read?: boolean;
    related_entity_type?: string;
    related_entity_id?: string;
    created_at?: string;
  }
  
  export interface ChatMessage {
    id: string;
    room_id: string;
    user_id?: string;
    content: string;
    created_at?: string;
    updated_at?: string;
    profiles?: {
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    }
  }
  
  export interface ChatRoom {
    id: string;
    name: string;
    description?: string;
    is_private?: boolean;
    created_by?: string;
    status?: string;
    created_at?: string;
  }
  
  export interface DatabaseTable {
    id: string;
    created_at?: string;
    [key: string]: any;
  }
  
  export interface Education {
    id: string;
    user_id: string;
    institution: string;
    degree?: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Experience {
    id: string;
    user_id: string;
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description?: string;
    is_current?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Skill {
    id: string;
    user_id: string;
    name: string;
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years_of_experience?: number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Project {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    url?: string;
    image_url?: string;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Member {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    bio?: string;
    avatar_url?: string;
    company?: string;
    role?: string;
    location?: string;
    contact_email?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    industry?: string;
    interests?: string[];
    created_at: string;
    updated_at: string;
  }
  
  export interface MembershipApplication {
    id: string;
    user_id: string;
    phone: string;
    department: string;
    year_of_study: string;
    interests: string[];
    previous_experience?: string;
    expectations?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
  }
  
  export interface ForumTopicWithRelations extends ForumTopic {
    profiles?: User;
    categories?: ForumCategory;
    replies_count?: number;
  }
  
  export interface ExtendedForumTopic extends ForumTopic {
    replies_count?: number;
    author_name?: string;
  }
  
  export interface AdminStatsResult {
    success: boolean;
    data?: {
      usersCount: number;
      eventsCount: number;
      startupsCount: number;
      mentorsCount: number;
      recordingsCount: number;
    };
    error?: any;
  }
  
  export interface ProfilesData {
    totalProfiles: number;
    roles: { role: string; count: number }[];
    locations: { location: string; count: number }[];
    companies: { company: string; count: number }[];
    newProfiles: { date: string; count: number }[];
  }
  
  export interface MergedUser extends User {
    settings?: UserSettings;
  }
  
  export interface ChatMessageWithProfiles extends ChatMessage {
    profiles?: {
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    }
  }
  
  export interface ExtendedMentorProfile extends MentorProfile {
    profiles?: {
      first_name: string;
      last_name: string;
      profession: string;
      company: string;
      profile_image_url: string;
    };
    industry?: string;
    experience?: string;
  }
  
  export interface RecentActivity {
    id: string;
    created_at: string;
    date: string;
    type: string;
    description: string;
    user_id?: string;
    event_id?: string;
    recording_id?: string;
  }
  
  export interface Sponsor {
    id: string;
    company_name: string;
    description?: string;
    website_url?: string;
    logo_url?: string;
    is_active: boolean;
    display_order: number;
    partnership_start_date?: string;
    partnership_end_date?: string;
    created_at?: string;
    updated_at?: string;
  }
  