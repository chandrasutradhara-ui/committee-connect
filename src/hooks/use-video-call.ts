import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callState, setCallState] = useState<
    "idle" | "calling" | "ringing" | "connecting" | "connected"
  >("idle");

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initiateCall = useMutation(api.calls.initiate);
  const answerCall = useMutation(api.calls.answer);
  const endCall = useMutation(api.calls.end);
  const sendOffer = useMutation(api.signals.sendOffer);
  const sendAnswer = useMutation(api.signals.sendAnswer);
  const sendIceCandidate = useMutation(api.signals.sendIceCandidate);

  const activeCall = useQuery(api.calls.getActiveCall);
  const incomingOffer = useQuery(api.calls.getIncomingOffer);
  const outgoingOffer = useQuery(api.calls.getOutgoingOffer);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Failed to get media devices:", error);
      throw error;
    }
  }, []);

  const setupPeerConnection = useCallback(
    (callId: string, stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;
      callIdRef.current = callId;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate({
            callId,
            candidate: JSON.stringify(event.candidate.toJSON()),
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === "connected" || state === "completed") {
          setCallState("connected");
        } else if (state === "disconnected" || state === "failed") {
          setCallState("idle");
        }
      };

      return pc;
    },
    [sendIceCandidate]
  );

  const startCall = useCallback(
    async (calleeId: string) => {
      try {
        setCallState("calling");
        const stream = await getLocalStream();
        const callId = await initiateCall({ calleeId });

        const pc = setupPeerConnection(callId, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve();
          } else {
            const check = () => {
              if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", check);
                resolve();
              }
            };
            pc.addEventListener("icegatheringstatechange", check);
          }
        });

        await sendOffer({
          callId,
          sdp: JSON.stringify(pc.localDescription?.toJSON()),
        });
      } catch (error) {
        console.error("Failed to start call:", error);
        setCallState("idle");
        throw error;
      }
    },
    [getLocalStream, setupPeerConnection, initiateCall, sendOffer]
  );

  const acceptCall = useCallback(
    async (callId: string, callerSDP: string) => {
      try {
        setCallState("connecting");
        const stream = await getLocalStream();
        const pc = setupPeerConnection(callId, stream);

        await pc.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(callerSDP))
        );

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === "complete") {
            resolve();
          } else {
            const check = () => {
              if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", check);
                resolve();
              }
            };
            pc.addEventListener("icegatheringstatechange", check);
          }
        });

        const answerSdp = JSON.stringify(pc.localDescription?.toJSON());
        await answerCall({ callId, sdp: answerSdp });
        await sendAnswer({ callId, sdp: answerSdp });
      } catch (error) {
        console.error("Failed to accept call:", error);
        setCallState("idle");
        throw error;
      }
    },
    [getLocalStream, setupPeerConnection, answerCall, sendAnswer]
  );

  // Handle answer received (caller side)
  useEffect(() => {
    if (!outgoingOffer?.calleeSDP || callState !== "calling") return;
    if (!peerConnectionRef.current) return;

    const pc = peerConnectionRef.current;
    pc.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(outgoingOffer.calleeSDP))
    ).then(() => {
      setCallState("connecting");
    }).catch(console.error);
  }, [outgoingOffer, callState]);

  // Handle ICE candidates from the other party
  useEffect(() => {
    if (!activeCall || !peerConnectionRef.current) return;

    const pc = peerConnectionRef.current;
    const isCaller = activeCall.callerId !== activeCall.calleeId;
    const candidates = isCaller
      ? activeCall.calleeCandidates
      : activeCall.callerCandidates;

    candidates.forEach(async (candidateStr: string) => {
      try {
        const candidate = new RTCIceCandidate(JSON.parse(candidateStr));
        if (pc.remoteDescription) {
          await pc.addIceCandidate(candidate);
        }
      } catch (e) {
        console.warn("Failed to add ICE candidate:", e);
      }
    });
  }, [activeCall]);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  const hangUp = useCallback(async () => {
    if (callIdRef.current) {
      try {
        await endCall({ callId: callIdRef.current });
      } catch (e) {
        console.warn("Failed to end call:", e);
      }
    }

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallState("idle");
    callIdRef.current = null;
  }, [endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peerConnectionRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Reset call state when activeCall becomes null
  useEffect(() => {
    if (!activeCall && callState !== "idle" && callState !== "calling") {
      hangUp();
    }
  }, [activeCall, callState, hangUp]);

  return {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callState,
    activeCall,
    incomingOffer,
    outgoingOffer,
    startCall,
    acceptCall,
    toggleMute,
    toggleVideo,
    hangUp,
    setCallState,
  };
}
