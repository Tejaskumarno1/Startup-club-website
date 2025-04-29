
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/types";

export interface ImportantMember {
  id: string;
  name: string;
  role: string;
  company?: string;
  bio?: string;
  avatar_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  expertise?: string[];
  display_order: number;
}

export const fetchImportantMembers = async (): Promise<ImportantMember[]> => {
  // Using "any" casting to bypass TypeScript restrictions since this table
  // isn't in the generated types yet
  const { data, error } = await (supabase as any)
    .from('important_members')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching important members:', error);
    return [];
  }

  return data || [];
};

export const addImportantMember = async (member: Omit<ImportantMember, 'id'>) => {
  // Using "any" casting to bypass TypeScript restrictions
  const { data, error } = await (supabase as any)
    .from('important_members')
    .insert([member])
    .select();

  if (error) {
    console.error('Error adding important member:', error);
    throw error;
  }

  return data?.[0];
};

export const updateImportantMember = async (id: string, updates: Partial<ImportantMember>) => {
  // Using "any" casting to bypass TypeScript restrictions
  const { data, error } = await (supabase as any)
    .from('important_members')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating important member:', error);
    throw error;
  }

  return data?.[0];
};

export const deleteImportantMember = async (id: string) => {
  // Using "any" casting to bypass TypeScript restrictions
  const { error } = await (supabase as any)
    .from('important_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting important member:', error);
    throw error;
  }

  return true;
};
