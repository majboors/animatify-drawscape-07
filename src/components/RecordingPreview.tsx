import { useEffect, useRef } from "react";

interface RecordingPreviewProps {
  stream: MediaStream | null;
}

export const RecordingPreview = ({ stream }: RecordingPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="rounded-lg w-48 h-36 object-cover border-2 border-white shadow-lg mb-2"
    />
  );
};