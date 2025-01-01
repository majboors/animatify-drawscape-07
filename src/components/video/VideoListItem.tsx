import { VideoDirectFetcher } from "./VideoDirectFetcher";

interface VideoListItemProps {
  recording: {
    id: string;
    name: string;
    created_at: string;
    video_data: string;
  };
  onPlay: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoListItem = ({ recording, onPlay, onDelete }: VideoListItemProps) => {
  return (
    <VideoDirectFetcher
      recordingId={recording.id}
      onPlay={onPlay}
      onDelete={onDelete}
    />
  );
};