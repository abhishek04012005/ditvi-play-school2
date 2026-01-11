import { supabase } from './supabase';

/**
 * Enquiry Utility Functions
 * Handles: enquiry number generation, database operations
 */

/**
 * Generate unique enquiry number
 * Format: ENQ-YYYY-NNNNN (e.g., ENQ-2026-00001)
 * 
 * @returns {Promise<string>} Unique enquiry number
 */
export const generateEnquiryNumber = async (): Promise<string> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get the last enquiry number for this year
    const { data, error } = await supabase
      .from('enquiries')
      .select('enquiry_number')
      .like('enquiry_number', `ENQ-${currentYear}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last enquiry number:', error);
      throw error;
    }

    // Extract the sequence number
    let nextSequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].enquiry_number;
      const sequencePart = parseInt(lastNumber.split('-')[2]);
      nextSequence = sequencePart + 1;
    }

    // Format: ENQ-2026-00001
    const enquiryNumber = `ENQ-${currentYear}-${String(nextSequence).padStart(5, '0')}`;
    
    console.log(`Generated enquiry number: ${enquiryNumber}`);
    return enquiryNumber;
  } catch (error) {
    console.error('Error generating enquiry number:', error);
    throw new Error('Failed to generate enquiry number');
  }
};

/**
 * Save enquiry to database
 * 
 * @param enquiryData - Enquiry data
 * @returns {Promise<any>} Created enquiry record
 */
export const saveEnquiryToDatabase = async (enquiryData: {

  parent_name: string;
  child_name: string;
  phone: string;
  program: string;
  status?: string;
  notes?: any;
}): Promise<any> => {
  try {
    // Generate enquiry number
    const enquiry_number = await generateEnquiryNumber();

    const { data, error } = await supabase
      .from('enquiries')
      .insert([{
        ...enquiryData,
        enquiry_number,
        status: enquiryData.status || 'new',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving enquiry to database:', error);
      throw error;
    }

    console.log(`Enquiry saved to database: ${enquiry_number}`);
    return data;
  } catch (error) {
    console.error('Error in saveEnquiryToDatabase:', error);
    throw error;
  }
};

/**
 * Get enquiry by enquiry number
 * 
 * @param enquiryNumber - The enquiry number
 * @returns {Promise<any>} Enquiry record or null
 */
export const getEnquiryByNumber = async (enquiryNumber: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('enquiry_number', enquiryNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    throw error;
  }
};

/**
 * Get all enquiries (for admin dashboard)
 * 
 * @param filters - Optional filters (status, phone, etc)
 * @returns {Promise<any[]>} Array of enquiry records
 */
export const getAllEnquiries = async (filters?: {
  status?: string;
  program?: string;
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<any[]> => {
  try {
    let query = supabase.from('enquiries').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.program) {
      query = query.eq('program', filters.program);
    }

    if (filters?.phone) {
      query = query.eq('phone', filters.phone);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    throw error;
  }
};

/**
 * Update enquiry status (for admin)
 * 
 * @param enquiryNumber - The enquiry number
 * @param status - New status (new, contacted, converted, rejected, etc)
 * @param notes - Admin notes
 * @returns {Promise<any>} Updated record
 */
export const updateEnquiryStatus = async (
  enquiryNumber: string,
  status: string,
  notes?: any
): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .update({
        status,
        notes: notes || null,
        notes_updated_at: new Date().toISOString(),
      })
      .eq('enquiry_number', enquiryNumber)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`Updated enquiry status: ${enquiryNumber} → ${status}`);
    return data;
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    throw error;
  }
};

/**
 * Delete enquiry from database
 * 
 * @param enquiryNumber - The enquiry number
 * @returns {Promise<boolean>} Success flag
 */
export const deleteEnquiry = async (enquiryNumber: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('enquiry_number', enquiryNumber);

    if (error) {
      throw error;
    }

    console.log(`Deleted enquiry: ${enquiryNumber}`);
    return true;
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    throw error;
  }
};
