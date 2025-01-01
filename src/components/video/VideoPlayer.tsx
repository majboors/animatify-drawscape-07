interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  return (
    <video
      src={url}
      className="w-full rounded-lg border h-32 object-cover"
      preload="metadata"
      controls
    />
  );
};