import { createClient } from '@supabase/supabase-js';
import { StaffMember, Shift, PaperworkRecord, StoreInfo } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchAllData = async () => {
  const [
    { data: staffData, error: staffError },
    { data: shiftsData, error: shiftsError },
    { data: paperworkData, error: paperworkError },
    { data: storeInfoData, error: storeInfoError },
  ] = await Promise.all([
    supabase.from('staff').select('*'),
    supabase.from('shifts').select('*'),
    supabase.from('paperwork').select('*'),
    supabase.from('store_info').select('*').limit(1).maybeSingle()
  ]);

  if (staffError) console.error(`Staff error:`, staffError);
  if (shiftsError) console.error(`Shifts error:`, shiftsError);
  if (paperworkError) console.error(`Paperwork error:`, paperworkError);

  if (staffError || shiftsError || paperworkError) {
    throw new Error('Failed to fetch data from Supabase. Please check database permissions.');
  }

  const fallbackStoreInfo: StoreInfo = {
    name: "New Store",
    storeNumber: "1",
    location: "Unknown Location",
    managerName: "Manager",
    phone: "000-000-0000",
    targetWeeklyHours: 320,
    standardStations: ["Storefront", "Kitchen", "Janitorial"],
    attendanceGuidelines: "• Arrive 10 minutes prior to scheduled start time in full store uniform & name badge.\n• Shift trades require 24-hour supervisor approval and mutual sign-off in the log book."
  };
  
  const storeInfo = (storeInfoData && !storeInfoError) ? storeInfoData : fallbackStoreInfo;

  return {
    staff: staffData || [],
    shifts: shiftsData || [],
    paperwork: paperworkData || [],
    storeInfo
  };
};

export const saveStaffToDB = async (staff: StaffMember) => {
  const { error } = await supabase.from('staff').upsert(staff);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const deleteStaffFromDB = async (id: string) => {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const saveShiftToDB = async (shift: Shift) => {
  const { error } = await supabase.from('shifts').upsert(shift);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const deleteShiftFromDB = async (id: string) => {
  const { error } = await supabase.from('shifts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const savePaperworkToDB = async (record: PaperworkRecord) => {
  const { error } = await supabase.from('paperwork').upsert(record);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const deletePaperworkFromDB = async (id: string) => {
  const { error } = await supabase.from('paperwork').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const saveStoreInfoToDB = async (info: StoreInfo) => {
  const { error } = await supabase.from('store_info').upsert({ id: 1, ...info });
  if (error) throw new Error(error.message);
  return { success: true };
};
