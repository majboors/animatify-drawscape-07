import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasRef } from "@/components/Canvas";
import { ExtendedCanvas } from "@/types/fabric";

export const saveBoardState = async (canvasRef: CanvasRef | null, recordingId: string) => {
  try {
    console.log("[boardState] Attempting to save board state for recording:", recordingId);
    
    if (!recordingId) {
      throw new Error("Recording ID is required to save board state");
    }

    const canvas = await getFabricCanvas(canvasRef);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const boardData = canvas.toJSON();
    console.log("[boardState] Board data prepared:", boardData);

    const { data, error } = await supabase
      .from('board_states')
      .insert([{ 
        recording_id: recordingId, 
        board_data: boardData 
      }])
      .select()
      .single();

    if (error) {
      console.error("[boardState] Supabase error while saving board state:", error);
      throw error;
    }

    console.log("[boardState] Board state saved successfully:", data);
    toast.success("Board state saved!");
    return data;
  } catch (error) {
    console.error('[boardState] Error saving board state:', error);
    toast.error("Failed to save board state");
    throw error;
  }
};

const getFabricCanvas = async (canvasRef: CanvasRef | null): Promise<ExtendedCanvas | null> => {
  if (!canvasRef) {
    console.warn("[boardState] Canvas reference is null");
    return null;
  }
  
  if ('getFabricCanvas' in canvasRef) {
    const canvas = (canvasRef as any).getFabricCanvas();
    if (!canvas) {
      console.warn("[boardState] getFabricCanvas returned null");
    }
    return canvas;
  }
  
  console.warn("[boardState] getFabricCanvas method not found in canvas reference");
  return null;
};

export const loadBoardStates = async (recordingId: string) => {
  try {
    console.log("[boardState] Loading board states for recording:", recordingId);
    
    if (!recordingId) {
      throw new Error("Recording ID is required to load board states");
    }

    const { data, error } = await supabase
      .from('board_states')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("[boardState] Supabase error while loading board states:", error);
      throw error;
    }

    console.log("[boardState] Board states loaded successfully:", data);
    return data;
  } catch (error) {
    console.error('[boardState] Error loading board states:', error);
    toast.error("Failed to load board states");
    return [];
  }
};

// Dispatch a custom event to load board state
export const dispatchLoadBoardState = (boardData: any) => {
  const event = new CustomEvent('loadBoardState', { detail: boardData });
  window.dispatchEvent(event);
};