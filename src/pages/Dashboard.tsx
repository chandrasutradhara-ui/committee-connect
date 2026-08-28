import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { useWebRTC } from "@/hooks/use-video-call";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ChatView } from "@/components/ChatView";
import { VideoCall } from "@/components/VideoCall";

type Tab = "items" | "bookings" | "messages" | "members";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("items");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");

  usePresence();

  const myItems = useQuery(api.items.getMyItems);
  const myBookings = useQuery(api.bookings.getMyBookings);
  const incomingBookings = useQuery(api.bookings.getBookingsForMyItems);
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
    setTab("messages");
  };

  const startVideoCall = async (userId: string) => {
    try {
      await startCall(userId);
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
    } catch (e) {
      console.error("Failed to accept call:", e);
    }
  };

  const incomingCaller = incomingOffer
    ? allUsers?.find((u) => u._id === incomingOffer.callerId)
    : null;

  const tabs: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: "items", label: "My Items", icon: Package },
    { key: "bookings", label: "Bookings", icon: Calendar },
    { key: "messages", label: "Messages", icon: MessageCircle },
    { key: "members", label: "Members", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Incoming call modal */}
      {incomingOffer && incomingCaller && callState === "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 border border-border/60">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-primary">
              {incomingCaller.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold mb-1">{incomingCaller.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Incoming video call…
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
                size="lg"
                className="rounded-full px-8 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAcceptCall}
              >
                <Video className="w-5 h-5 mr-2" />
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-full lg:w-80 border-r border-border/50 bg-card/30 flex flex-col">
        {/* Brand header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground">
              M
            </div>
            <span className="font-bold text-sm tracking-tight">MAga</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="px-4 py-2.5 border-b border-border/30">
          <p className="text-xs text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {user?.name || "User"}
            </span>
          </p>
          {user?.role === "admin" && (
            <button
              className="text-[10px] font-mono text-primary hover:text-primary/80 mt-0.5"
              onClick={() => navigate("/admin")}
            >
              → Admin Panel
            </button>
          )}
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-border/50">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                tab === t.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "items" && (
            <div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Your Items
                </span>
                <Button
                  size="sm"
                  className="h-7 text-[11px] gap-1"
                  onClick={() => navigate("/post")}
                >
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </div>
              {myItems === undefined ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Loading…
                </div>
              ) : myItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No items yet. Create your first listing.
                </div>
              ) : (
                <div className="px-2 pb-2">
                  {myItems.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigate(`/item/${item._id}`)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <p className="text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-primary">
                          ${item.price}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            item.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "bookings" && (
            <div>
              <div className="px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Your Bookings
                </span>
              </div>
              {myBookings === undefined ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Loading…
                </div>
              ) : myBookings.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No bookings yet.
                </div>
              ) : (
                <div className="px-2 pb-2">
                  {myBookings.map((b) => (
                    <div
                      key={b._id}
                      className="px-3 py-2.5 rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">
                          Booking #{b._id.slice(-6)}
                        </p>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            b.status === "confirmed"
                              ? "bg-green-500/10 text-green-500"
                              : b.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ${b.amount} ·{" "}
                        {new Date(b.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {incomingBookings && incomingBookings.length > 0 && (
                <>
                  <div className="px-4 py-3 border-t border-border/30">
                    <span className="text-xs font-medium text-muted-foreground">
                      Incoming
                    </span>
                  </div>
                  <div className="px-2 pb-2">
                    {incomingBookings.map((b) => (
                      <IncomingBooking key={b._id} booking={b} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "messages" && !selectedUserId && (
            <div>
              <div className="px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Conversations
                </span>
              </div>
              {allUsers && allUsers.length > 0 ? (
                <div className="px-2 pb-2">
                  {allUsers.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => openChat(u._id, u.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {u.online ? "Online" : "Offline"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            startVideoCall(u._id);
                          }}
                        >
                          <Video className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No members found.
                </div>
              )}
            </div>
          )}

          {tab === "messages" && selectedUserId && (
            <div className="h-full">
              <ChatView
                otherUserId={selectedUserId}
                otherUserName={selectedUserName}
                onBack={() => setSelectedUserId(null)}
                onStartCall={(id) => startVideoCall(id)}
                onStartVideo={(id) => startVideoCall(id)}
              />
            </div>
          )}

          {tab === "members" && (
            <div>
              <div className="px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">
                  All Members
                </span>
              </div>
              {allUsers === undefined ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Loading…
                </div>
              ) : allUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  No other members yet.
                </div>
              ) : (
                <div className="px-2 pb-2">
                  {allUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {u.online ? "Online" : "Offline"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openChat(u._id, u.name)}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                        {u.online && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => startVideoCall(u._id)}
                          >
                            <Video className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main area - shows video call when active */}
      <div className="flex-1 flex flex-col">
        {callState !== "idle" ? (
          <VideoCall
            localStream={localStream}
            remoteStream={remoteStream}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            callState={callState}
            calleeName={selectedUserName}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onHangUp={() => {
              hangUp();
            }}
          />
        ) : selectedUserId && tab === "messages" ? (
          <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Chat with {selectedUserName}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <LayoutDashboard className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Welcome to MAga</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Browse the catalog, manage your bookings, or connect with members.
              Use the sidebar to navigate.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/catalog")}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Browse Catalog
              </Button>
              <Button size="sm" onClick={() => navigate("/post")}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Post Item
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



function IncomingBooking({ booking }: { booking: any }) {
  const confirm = useMutation(api.bookings.confirm);
  const cancel = useMutation(api.bookings.cancel);

  return (
    <div className="px-3 py-2.5 rounded-lg bg-accent/30 border border-border/40">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">Booking #{booking._id.slice(-6)}</p>
        <span className="text-[10px] text-muted-foreground">
          ${booking.amount}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {new Date(booking.startTime).toLocaleDateString()}
      </p>
      {booking.status === "pending" && (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="h-6 text-[10px] bg-green-600 hover:bg-green-700"
            onClick={() => confirm({ bookingId: booking._id })}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-6 text-[10px]"
            onClick={() => cancel({ bookingId: booking._id })}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
