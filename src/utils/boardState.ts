import { supabase } from "@/integrations/supabase/client";
import { CanvasRef } from "@/components/Canvas";
import { toast } from "sonner";

export const saveBoardState = async (canvas: CanvasRef, recordingId: string) => {
  try {
    console.log("[boardState] Saving board state for recording:", recordingId);
    const boardData = canvas.toJSON();

    const { data, error } = await supabase
      .from('board_states')
      .insert({
        recording_id: recordingId,
        board_data: boardData
      })
      .select()
      .single();

    if (error) {
      console.error("[boardState] Error saving board state:", error);
      throw error;
    }

    console.log("[boardState] Board state saved:", data);
    toast.success("Board state saved successfully");
    return data;
  } catch (error) {
    console.error("[boardState] Failed to save board state:", error);
    toast.error("Failed to save board state");
    throw error;
  }
};

export const loadBoardStates = async (recordingId: string) => {
  try {
    console.log("[boardState] Loading board states for recording:", recordingId);
    const { data, error } = await supabase
      .from('board_states')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("[boardState] Error loading board states:", error);
      throw error;
    }

    console.log("[boardState] Board states loaded:", data);
    return data;
  } catch (error) {
    console.error("[boardState] Failed to load board states:", error);
    toast.error("Failed to load board states");
    throw error;
  }
};