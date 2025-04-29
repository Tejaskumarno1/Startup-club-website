
import { supabase } from "@/integrations/supabase/client";
import { uploadRecordingThumbnail } from "./api/storageApi";
import { PastRecording } from "./types";

// Get all past recordings
export const getPastRecordings = async () => {
  try {
    const { data, error } = await supabase
      .from('past_recordings')
      .select(`
        *,
        events:event_id (
          title,
          start_datetime
        )
      `)
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Error fetching recordings:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getPastRecordings:', err);
    return [];
  }
};

// Get a specific recording by ID
export const getRecordingById = async (recordingId) => {
  try {
    const { data, error } = await supabase
      .from('past_recordings')
      .select(`
        *,
        events:event_id (
          title,
          start_datetime
        )
      `)
      .eq('id', recordingId)
      .single();

    if (error) {
      console.error('Error fetching recording:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getRecordingById:', err);
    return null;
  }
};

// Get events for recording selection dropdown
export const getEventsForRecordings = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title')
      .order('start_datetime', { ascending: false });
    
    if (error) {
      console.error('Error fetching events for recordings:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getEventsForRecordings:', err);
    return [];
  }
};

// Create a new recording with thumbnail upload support
export const createRecording = async (recordingData, thumbnailFile = null) => {
  try {
    // Check if the user is authenticated before creating
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User is not authenticated');
      return { success: false, error: { message: 'You must be logged in to create recordings' } };
    }
    
    // First, insert the recording data without the thumbnail
    const insertData = {
      title: recordingData.title,
      description: recordingData.description,
      event_id: recordingData.event_id,
      recording_url: recordingData.recording_url,
      duration: recordingData.duration,
      presenter_name: recordingData.presenter_name,
      recorded_at: recordingData.recorded_at,
      is_public: recordingData.is_public,
      thumbnail_url: recordingData.thumbnail_url
    };

    // Remove undefined values to avoid inserting null values
    Object.keys(insertData).forEach(key => {
      if (insertData[key] === undefined) {
        delete insertData[key];
      }
    });

    console.log('Creating recording with data:', insertData);

    // Check if the past_recordings table contains the needed columns before inserting
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('past_recordings')
        .select('*')
        .limit(1);
      
      if (columnsError) {
        console.error('Error checking table schema:', columnsError);
        // Continue anyway, but log the error
      } else {
        // If we got a row, check if columns exist and remove any that don't
        if (columns && columns.length > 0) {
          const tableColumns = Object.keys(columns[0]);
          Object.keys(insertData).forEach(key => {
            if (!tableColumns.includes(key)) {
              console.warn(`Column '${key}' doesn't exist in past_recordings table. Removing from insert data.`);
              delete insertData[key];
            }
          });
        }
      }
    } catch (schemaErr) {
      console.error('Error checking schema:', schemaErr);
      // Continue anyway
    }

    const { data, error } = await supabase
      .from('past_recordings')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating recording:', error);
      return { success: false, error };
    }

    // If thumbnail file is provided, upload it
    if (thumbnailFile && data.id) {
      const thumbnailResult = await uploadRecordingThumbnail(thumbnailFile, data.id);
      console.log('Thumbnail upload result:', thumbnailResult);
      
      if (thumbnailResult?.url) {
        // Check if thumbnail_url column exists before updating
        try {
          const { data: columns } = await supabase
            .from('past_recordings')
            .select('*')
            .limit(1);
          
          if (columns && columns.length > 0 && Object.keys(columns[0]).includes('thumbnail_url')) {
            // Update the recording with the thumbnail URL
            const { error: updateError } = await supabase
              .from('past_recordings')
              .update({ thumbnail_url: thumbnailResult.url })
              .eq('id', data.id);
            
            if (updateError) {
              console.error('Error updating recording with thumbnail URL:', updateError);
            }
          } else {
            console.warn("Column 'thumbnail_url' doesn't exist in past_recordings table. Skipping thumbnail update.");
          }
        } catch (err) {
          console.error('Error checking thumbnail_url column:', err);
        }
      }
    }

    return { success: true, recordingId: data.id };
  } catch (err) {
    console.error('Error in createRecording:', err);
    return { success: false, error: err };
  }
};

// Update an existing recording with thumbnail upload support
export const updateRecording = async (recordingId, recordingData, thumbnailFile = null) => {
  try {
    // Check if the user is authenticated before updating
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User is not authenticated');
      return { success: false, error: { message: 'You must be logged in to update recordings' } };
    }
    
    // Create a clean update object without properties that don't exist in the table
    const updateData = {
      title: recordingData.title,
      description: recordingData.description,
      event_id: recordingData.event_id,
      recording_url: recordingData.recording_url,
      duration: recordingData.duration,
      presenter_name: recordingData.presenter_name,
      recorded_at: recordingData.recorded_at,
      is_public: recordingData.is_public,
      thumbnail_url: recordingData.thumbnail_url
    };
    
    // Remove undefined values to avoid setting fields to null unintentionally
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    console.log('Updating recording with data:', updateData);
    
    // Check if the past_recordings table contains the needed columns before updating
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('past_recordings')
        .select('*')
        .limit(1);
      
      if (columnsError) {
        console.error('Error checking table schema:', columnsError);
        // Continue anyway, but log the error
      } else {
        // If we got a row, check if columns exist and remove any that don't
        if (columns && columns.length > 0) {
          const tableColumns = Object.keys(columns[0]);
          Object.keys(updateData).forEach(key => {
            if (!tableColumns.includes(key)) {
              console.warn(`Column '${key}' doesn't exist in past_recordings table. Removing from update data.`);
              delete updateData[key];
            }
          });
        }
      }
    } catch (schemaErr) {
      console.error('Error checking schema:', schemaErr);
      // Continue anyway
    }
    
    // If thumbnail file is provided, upload it first
    if (thumbnailFile) {
      const thumbnailResult = await uploadRecordingThumbnail(thumbnailFile, recordingId);
      console.log('Thumbnail upload result:', thumbnailResult);
      
      if (thumbnailResult?.url && 'thumbnail_url' in updateData) {
        updateData.thumbnail_url = thumbnailResult.url;
      }
    }
    
    const { error } = await supabase
      .from('past_recordings')
      .update(updateData)
      .eq('id', recordingId);

    if (error) {
      console.error('Error updating recording:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in updateRecording:', err);
    return { success: false, error: err };
  }
};

// Delete a recording
export const deleteRecording = async (recordingId) => {
  try {
    // Check if the user is authenticated before deleting
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User is not authenticated');
      return { success: false, error: { message: 'You must be logged in to delete recordings' } };
    }
    
    const { error } = await supabase
      .from('past_recordings')
      .delete()
      .eq('id', recordingId);

    if (error) {
      console.error('Error deleting recording:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in deleteRecording:', err);
    return { success: false, error: err };
  }
};

// Increment view count for a recording
export const incrementViewCount = async (recordingId) => {
  try {
    const { error } = await supabase.rpc('increment_recording_view_count', {
      recording_id: recordingId
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in incrementViewCount:', err);
    return { success: false, error: err };
  }
};

// This is the missing function that was causing the error
export const incrementRecordingViews = async (recordingId) => {
  return incrementViewCount(recordingId);
};

// Get recording statistics
export const getRecordingStats = async () => {
  try {
    // Get total count of recordings
    const { count: totalRecordings, error: countError } = await supabase
      .from('past_recordings')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching recordings count:', countError);
      return { totalRecordings: 0, totalViews: 0 };
    }

    // Get sum of all views
    const { data: viewData, error: viewError } = await supabase
      .from('past_recordings')
      .select('view_count');

    if (viewError) {
      console.error('Error fetching view counts:', viewError);
      return { totalRecordings, totalViews: 0 };
    }

    const totalViews = viewData.reduce((sum, item) => sum + (item.view_count || 0), 0);

    return { totalRecordings, totalViews };
  } catch (err) {
    console.error('Error in getRecordingStats:', err);
    return { totalRecordings: 0, totalViews: 0 };
  }
};
