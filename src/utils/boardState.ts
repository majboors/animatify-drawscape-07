import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasRef } from "@/components/Canvas";
import { ExtendedCanvas } from "@/types/fabric";

export const saveBoardState = async (canvasRef: CanvasRef | null, recordingId: string) => {
  try {
    console.log("Attempting to save board state for recording:", recordingId);
    
    if (!recordingId) {
      throw new Error("Recording ID is required to save board state");
    }

    const canvas = await getFabricCanvas(canvasRef);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    const boardData = canvas.toJSON();
    console.log("Board data prepared:", boardData);

    const { data, error } = await supabase
      .from('board_states')
      .insert([{ 
        recording_id: recordingId, 
        board_data: boardData 
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error while saving board state:", error);
      throw error;
    }

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
  if (!canvasRef) {
    console.warn("Canvas reference is null");
    return null;
  }
  
  if ('getFabricCanvas' in canvasRef) {
    const canvas = (canvasRef as any).getFabricCanvas();
    if (!canvas) {
      console.warn("getFabricCanvas returned null");
    }
    return canvas;
  }
  
  console.warn("getFabricCanvas method not found in canvas reference");
  return null;
};

export const loadBoardStates = async (recordingId: string) => {
  try {
    console.log("Loading board states for recording:", recordingId);
    
    if (!recordingId) {
      throw new Error("Recording ID is required to load board states");
    }

    const { data, error } = await supabase
      .from('board_states')
      .select('*')
      .eq('recording_id', recordingId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase error while loading board states:", error);
      throw error;
    }

    console.log("Board states loaded successfully:", data);
    return data;
  } catch (error) {
    console.error('Error loading board states:', error);
    toast.error("Failed to load board states");
    return [];
  }
};