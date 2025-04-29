
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ImportantMember } from '@/lib/types';
import { deleteMemberProfileImage } from '@/lib/api/memberStorageApi';

// Fetch all important members
const fetchImportantMembers = async (): Promise<ImportantMember[]> => {
  const { data, error } = await (supabase as any)
    .from('important_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching important members:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Add a new important member
const addImportantMember = async (member: Omit<ImportantMember, 'id' | 'created_at' | 'updated_at'>): Promise<ImportantMember> => {
  const { data, error } = await (supabase as any)
    .from('important_members')
    .insert([member])
    .select()
    .single();

  if (error) {
    console.error('Error adding important member:', error);
    throw new Error(error.message);
  }

  return data;
};

// Update an existing important member
const updateImportantMember = async (member: ImportantMember): Promise<ImportantMember> => {
  // Store the current member data to check if avatar_url has changed
  let oldMemberData: ImportantMember | null = null;
  
  if (member.avatar_url) {
    // Get current member data to check if avatar URL has changed
    const { data: currentMember } = await (supabase as any)
      .from('important_members')
      .select('*')
      .eq('id', member.id)
      .single();
      
    oldMemberData = currentMember;
  }

  // Update the member in the database
  const { data, error } = await (supabase as any)
    .from('important_members')
    .update(member)
    .eq('id', member.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating important member:', error);
    throw new Error(error.message);
  }

  // If avatar URL has changed and there was an old URL, clean up the old image
  if (oldMemberData && 
      oldMemberData.avatar_url && 
      member.avatar_url && 
      oldMemberData.avatar_url !== member.avatar_url) {
    try {
      await deleteMemberProfileImage(oldMemberData.avatar_url);
    } catch (err) {
      // Just log the error but don't fail the update operation
      console.error("Failed to delete old profile image:", err);
    }
  }

  return data;
};

// Delete an important member
const deleteImportantMember = async (id: string): Promise<void> => {
  // First get the member data to get the avatar URL
  const { data: memberToDelete } = await (supabase as any)
    .from('important_members')
    .select('*')
    .eq('id', id)
    .single();

  // Delete the member from the database
  const { error } = await (supabase as any)
    .from('important_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting important member:', error);
    throw new Error(error.message);
  }

  // If member had an avatar, clean it up from storage
  if (memberToDelete && memberToDelete.avatar_url) {
    try {
      await deleteMemberProfileImage(memberToDelete.avatar_url);
    } catch (err) {
      // Just log the error but don't fail the delete operation
      console.error("Failed to delete profile image:", err);
    }
  }
};

// Custom hook to handle important members operations
export const useImportantMembers = () => {
  const queryClient = useQueryClient();
  const queryKey = ['important-members'];

  // Fetch important members
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchImportantMembers,
  });

  // Add new member mutation
  const addMutation = useMutation({
    mutationFn: addImportantMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update member mutation
  const updateMutation = useMutation({
    mutationFn: updateImportantMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: deleteImportantMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Helper methods to simplify component code
  const addMember = (member: Omit<ImportantMember, 'id' | 'created_at' | 'updated_at'>) => {
    return addMutation.mutateAsync(member);
  };

  const updateMember = (member: ImportantMember) => {
    return updateMutation.mutateAsync(member);
  };

  const deleteMember = (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    data,
    isLoading,
    error,
    addMember,
    updateMember,
    deleteMember,
    isAddingMember: addMutation.isPending,
    isUpdatingMember: updateMutation.isPending,
    isDeletingMember: deleteMutation.isPending,
  };
};
