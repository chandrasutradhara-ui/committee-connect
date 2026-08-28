import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { useWebRTC } from "@/hooks/use-video-call";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  LogOut,
  MessageCircle,
  Phone,
  Users,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ChatView } from "@/components/ChatView";
import { VideoCall } from "@/components/VideoCall";

type View = "users" | "chat" | "call";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("users");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  usePresence();

  const allUsers = useQuery(api.users.getAllUsers);

  const {
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callState,
    activeCall,
    incomingOffer,
    startCall,
    acceptCall,
    toggleMute,
    toggleVideo,
    hangUp,
  } = useWebRTC();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const openChat = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setView("chat");
  };

  const startVideoCall = async (userId: string) => {
    try {
      await startCall(userId);
      setView("call");
    } catch (e) {
      console.error("Failed to start call:", e);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingOffer) return;
    try {
      const caller = allUsers?.find((u) => u._id === incomingOffer.callerId);
      setSelectedUserId(incomingOffer.callerId);
      setSelectedUserName(caller?.name || "Unknown");
      await acceptCall(incomingOffer._id, incomingOffer.callerSDP || "");
      setView("call");
    } catch (e) {
      console.error("Failed to accept call:", e);
    }
  };

  const handleHangUp = () => {
    hangUp();
    if (selectedUserId) {
      setView("chat");
    } else {
      setView("users");
    }
  };

  const handleBackToUsers = () => {
    setView("users");
    setSelectedUserId(null);
  };

  // Incoming call notification
  const incomingCaller = incomingOffer
    ? allUsers?.find((u) => u._id === incomingOffer.callerId)
    : null;

  return (
    <div className="flex h-screen bg-background">
      {/* Incoming call notification */}
      {incomingOffer && incomingCaller && callState === "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
              {incomingCaller.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold mb-1">{incomingCaller.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Incoming video call...
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full px-8"
                onClick={hangUp}
              >
                <X className="w-5 h-5 mr-2" />
                Decline
              </Button>
              <Button
                variant="default"
                size="lg"
                className="rounded-full px-8 bg-green-600 hover:bg-green-700"
                onClick={handleAcceptCall}
              >
                <Video className="w-5 h-5 mr-2" />
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - user list */}
      <div
        className={`w-full lg:w-80 xl:w-96 border-r border-border bg-card/30 flex flex-col ${
          view !== "users" ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Members</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* User info bar */}
        <div className="px-4 py-2.5 border-b border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {user?.name || "User"}
            </span>
          </p>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          {allUsers === undefined ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Loading members...
            </div>
          ) : allUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2 px-4">
              <p className="text-sm text-center">No other members online</p>
              <p className="text-xs text-center">
                Share this app with your committee members
              </p>
            </div>
          ) : (
            <div className="py-1">
              {allUsers.map((u) => (
                <div
                  key={u._id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedUserId === u._id ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    {u.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.online ? "Online" : "Offline"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openChat(u._id, u.name);
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    {u.online && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          startVideoCall(u._id);
                        }}
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col ${
          view === "users" ? "hidden lg:flex" : "flex"
        }`}
      >
        {view === "users" ? (
          /* Welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Social Connect</h2>
            <p className="text-muted-foreground max-w-md">
              Connect with your committee members through video calls and
              messaging. Select a member from the sidebar to get started.
            </p>
            <div className="flex gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <span>Video Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>Audio</span>
              </div>
            </div>
          </div>
        ) : view === "chat" && selectedUserId ? (
          <ChatView
            otherUserId={selectedUserId}
            otherUserName={selectedUserName}
            onBack={handleBackToUsers}
            onStartCall={(id) => startVideoCall(id)}
            onStartVideo={(id) => startVideoCall(id)}
          />
        ) : view === "call" ? (
          <VideoCall
            localStream={localStream}
            remoteStream={remoteStream}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            callState={callState}
            calleeName={selectedUserName}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onHangUp={handleHangUp}
          />
        ) : null}
      </div>
    </div>
  );
}
