import { Member, MembershipApplication } from './types';
import { supabase } from './supabase';

/**
 * Helper functions for membership management
 */

// Function to get all members
export const getMembers = async (): Promise<Member[]> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as Member[];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

// Function to get members by industry
export const getMembersByIndustry = async (industry: string): Promise<Member[]> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('industry', industry)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as Member[];
  } catch (error) {
    console.error(`Error fetching members for industry ${industry}:`, error);
    return [];
  }
};

// Function to get a specific member
export const getMemberById = async (userId: string): Promise<Member | null> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        profiles:user_id (*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    return data as unknown as Member;
  } catch (error) {
    console.error(`Error fetching member ${userId}:`, error);
    return null;
  }
};

// Function to update a member's profile
export const updateMemberProfile = async (userId: string, updates: Partial<Member>): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('members')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating member profile:', error);
    return { success: false, error };
  }
};

// Function to create a new member
export const createMember = async (memberData: Omit<Member, 'id' | 'created_at'>): Promise<{ success: boolean; memberId?: string; error?: any }> => {
  try {
    // Use type assertion to bypass type checking as the actual DB schema may differ
    const { data, error } = await supabase
      .from('members')
      .insert(memberData as any)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, memberId: data.id };
  } catch (error) {
    console.error('Error creating member:', error);
    return { success: false, error };
  }
};

// Function to delete a member
export const deleteMember = async (userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting member:', error);
    return { success: false, error };
  }
};

// Function to get all membership applications
export const getMembershipApplications = async (): Promise<MembershipApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('membership_applications')
      .select(`
        *,
        user:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as MembershipApplication[];
  } catch (error) {
    console.error('Error fetching membership applications:', error);
    return [];
  }
};

// Function to get pending membership applications
export const getPendingApplications = async (): Promise<MembershipApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('membership_applications')
      .select(`
        *,
        user:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as unknown as MembershipApplication[];
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return [];
  }
};

// Function to submit a membership application
export const submitMembershipApplication = async (application: Omit<MembershipApplication, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<{ success: boolean; applicationId?: string; error?: any }> => {
  try {
    // Use type assertion to bypass type checking
    const { data, error } = await supabase
      .from('membership_applications')
      .insert({
        ...application,
        status: 'pending'
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, applicationId: data.id };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, error };
  }
};

// Function to approve a membership application
export const approveApplication = async (applicationId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // First update the application status
    const { data: appData, error: appError } = await supabase
      .from('membership_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (appError) throw appError;
    
    // Then create a new member record
    // Note: casting to unknown first to avoid TypeScript issues
    const data = appData as unknown as MembershipApplication;
    
    // Use type assertion for the insert operation
    await supabase
      .from('members')
      .insert({
        user_id: data.user_id,
        membership_level: 'standard',
        is_active: true
      } as any);
    
    return { success: true };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, error };
  }
};

// Function to reject a membership application
export const rejectApplication = async (applicationId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('membership_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting application:', error);
    return { success: false, error };
  }
};

// Function to check if a user has a pending application
export const hasUserApplied = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('status')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.length > 0;
  } catch (error) {
    console.error('Error checking user application status:', error);
    return false;
  }
};

// Function to get application status for a user
export const getUserApplicationStatus = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('membership_applications')
      .select('status')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    return data.status;
  } catch (error) {
    console.error('Error getting user application status:', error);
    return null;
  }
};
