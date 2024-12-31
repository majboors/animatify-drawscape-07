import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExtendedCanvas } from "../types/fabric";

export const saveBoardState = async (canvas: ExtendedCanvas, recordingId: string) => {
  try {
    const boardData = canvas.toJSON();
    const { error } = await supabase
      .from('board_states')
      .insert([{ recording_id: recordingId, board_data: boardData }]);

    if (error) throw error;
    toast.success("Board state saved!");
  } catch (error) {
    console.error('Error saving board state:', error);
    toast.error("Failed to save board state");
  }
};

export const loadBoardStates = async (recordingId: string) => {
  try {
    const { data, error } = await supabase
      .from('board_states')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading board states:', error);
    toast.error("Failed to load board states");
    return [];
  }
};