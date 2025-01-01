import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasRef } from "@/components/Canvas";
import { ExtendedCanvas } from "@/types/fabric";

export const saveBoardState = async (canvasRef: CanvasRef | null, recordingId: string) => {
  try {
    console.log("Saving board state for recording:", recordingId);
    const canvas = await getFabricCanvas(canvasRef);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const boardData = canvas.toJSON();
    const { data, error } = await supabase
      .from('board_states')
      .insert([{ recording_id: recordingId, board_data: boardData }])
      .select()
      .single();

    if (error) throw error;
    console.log("Board state saved successfully:", data);
    toast.success("Board state saved!");
    return data;
  } catch (error) {
    console.error('Error saving board state:', error);
    toast.error("Failed to save board state");
    throw error;
  }
};

const getFabricCanvas = async (canvasRef: CanvasRef | null): Promise<ExtendedCanvas | null> => {
  if (!canvasRef) return null;
  
  if ('getFabricCanvas' in canvasRef) {
    return (canvasRef as any).getFabricCanvas();
  }
  return null;
};

export const loadBoardStates = async (recordingId: string) => {
  try {
    console.log("Loading board states for recording:", recordingId);
    const { data, error } = await supabase
      .from('board_states')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    console.log("Board states loaded successfully:", data);
    return data;
  } catch (error) {
    console.error('Error loading board states:', error);
    toast.error("Failed to load board states");
    return [];
  }
};