import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CanvasRef } from "@/components/Canvas";
import { ExtendedCanvas } from "@/types/fabric";

export const saveBoardState = async (canvasRef: CanvasRef | null, recordingId: string) => {
  try {
    // Get the canvas instance from the ref using a custom method
    const canvas = await getFabricCanvas(canvasRef);
    if (!canvas) {
      throw new Error("Canvas not found");
    }

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

// Helper function to get the Fabric canvas instance from the ref
const getFabricCanvas = async (canvasRef: CanvasRef | null): Promise<ExtendedCanvas | null> => {
  if (!canvasRef) return null;
  
  // Access the canvas instance through a new method we'll add to the CanvasRef interface
  if ('getFabricCanvas' in canvasRef) {
    return (canvasRef as any).getFabricCanvas();
  }
  return null;
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