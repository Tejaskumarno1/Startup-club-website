
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MentorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  expertise: string[];
  experience_years: number;
  is_approved: boolean;
  created_at: string;
}

// Get all mentor applications (admin only)
export const getMentorApplications = async (): Promise<MentorApplication[]> => {
  try {
    // First, get the mentor profiles
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('id, user_id, expertise, is_approved, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Then, get the corresponding user profiles for each mentor profile
    const applications: MentorApplication[] = [];
    
    for (const mentorProfile of data) {
      // Fetch the user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', mentorProfile.user_id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile for mentor:', profileError);
        continue; // Skip this mentor if profile fetch fails
      }
      
      applications.push({
        id: mentorProfile.id,
        user_id: mentorProfile.user_id,
        full_name: `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim(),
        email: profileData?.email || '',
        expertise: mentorProfile.expertise || [],
        experience_years: 0, // Default to 0 since the column doesn't exist
        is_approved: !!mentorProfile.is_approved,
        created_at: mentorProfile.created_at
      });
    }

    return applications;
  } catch (error) {
    console.error('Error fetching mentor applications:', error);
    toast({
      title: 'Error',
      description: 'Failed to load mentor applications. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

// Mock data for development purposes
export const getMockMentorApplications = (): MentorApplication[] => {
  return [
    {
      id: '1',
      user_id: 'user1',
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      expertise: ['Marketing', 'Business Strategy'],
      experience_years: 8,
      is_approved: false,
      created_at: '2023-05-10T08:30:00Z'
    },
    {
      id: '2',
      user_id: 'user2',
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      expertise: ['Product Development', 'UX Design', 'Tech'],
      experience_years: 5,
      is_approved: true,
      created_at: '2023-05-08T14:20:00Z'
    },
    {
      id: '3',
      user_id: 'user3',
      full_name: 'Robert Johnson',
      email: 'robert.j@example.com',
      expertise: ['Finance', 'Venture Capital'],
      experience_years: 12,
      is_approved: false,
      created_at: '2023-05-15T11:45:00Z'
    },
    {
      id: '4',
      user_id: 'user4',
      full_name: 'Emily Chen',
      email: 'emily.chen@example.com',
      expertise: ['Software Development', 'AI', 'Tech Startups'],
      experience_years: 7,
      is_approved: false,
      created_at: '2023-05-12T09:15:00Z'
    },
    {
      id: '5',
      user_id: 'user5',
      full_name: 'Michael Brown',
      email: 'michael.b@example.com',
      expertise: ['Legal', 'IP Protection'],
      experience_years: 10,
      is_approved: true,
      created_at: '2023-05-05T16:30:00Z'
    }
  ];
};
