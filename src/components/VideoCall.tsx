import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callState: string;
  calleeName: string;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onHangUp: () => void;
}

function VideoStream({
  stream,
  muted,
  className,
}: {
  stream: MediaStream;
  muted?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}

export function VideoCall({
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  callState,
  calleeName,
  onToggleMute,
  onToggleVideo,
  onHangUp,
}: VideoCallProps) {
  return (
    <div className="relative flex flex-col h-full bg-gray-950 overflow-hidden">
      {/* Remote video - full background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {remoteStream ? (
          <VideoStream
            stream={remoteStream}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-white/70">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl font-bold">
              {calleeName.charAt(0).toUpperCase()}
            </div>
            <p className="text-lg font-medium">
              {callState === "calling" && "Calling..."}
              {callState === "connecting" && "Connecting..."}
              {callState === "ringing" && "Ringing..."}
              {callState === "connected" && "Connected"}
            </p>
            {callState !== "connected" && (
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Local video - pip corner */}
      {localStream && (
        <div className="absolute top-4 right-4 z-10 w-40 h-28 sm:w-48 sm:h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
          {isVideoOff ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/50">
              <VideoOff className="w-8 h-8" />
            </div>
          ) : (
            <VideoStream
              stream={localStream}
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Call info overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
          {calleeName}
        </div>
      </div>

      {/* Call controls */}
      <div className="absolute bottom-0 inset-x-0 z-10 flex justify-center gap-3 p-6 bg-gradient-to-t from-black/60 to-transparent">
        <Button
          size="lg"
          variant={isMuted ? "destructive" : "secondary"}
          className="rounded-full w-14 h-14 p-0 border-0"
          onClick={onToggleMute}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
        <Button
          size="lg"
          variant={isVideoOff ? "destructive" : "secondary"}
          className="rounded-full w-14 h-14 p-0 border-0"
          onClick={onToggleVideo}
        >
          {isVideoOff ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </Button>
        <Button
          size="lg"
          variant="destructive"
          className="rounded-full w-14 h-14 p-0 bg-red-500 hover:bg-red-600 border-0"
          onClick={onHangUp}
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
