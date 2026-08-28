import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  MessageCircle,
  Send,
  Tag,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState("60");
  const [comment, setComment] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const item = useQuery(api.items.getById, { itemId: itemId! });
  const comments = useQuery(api.comments.getByItem, { itemId: itemId! });
  const bookings = useQuery(api.bookings.getBookingsForItem, {
    itemId: itemId!,
  });

  const createBooking = useMutation(api.bookings.create);
  const addComment = useMutation(api.comments.add);
  const removeItem = useMutation(api.items.remove);
  const markPaid = useMutation(api.bookings.markPaid);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const isOwner = item.ownerId === user?._id;

  const handleBook = async () => {
    if (!bookingDate || !bookingTime) return;
    setBookingLoading(true);
    try {
      const start = new Date(`${bookingDate}T${bookingTime}`).getTime();
      const end = start + parseInt(bookingDuration) * 60 * 1000;
      await createBooking({ itemId: itemId!, startTime: start, endTime: end });
      setBookingDate("");
      setBookingTime("");
    } catch (e) {
      console.error(e);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    const text = comment.trim();
    setComment("");
    try {
      await addComment({ itemId: itemId!, content: text });
    } catch (e) {
      console.error(e);
      setComment(text);
    }
  };

  const handlePay = async (bookingId: string) => {
    setPaying(true);
    try {
      await markPaid({ bookingId });
    } catch (e) {
      console.error(e);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/catalog")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center font-bold text-[10px] text-primary-foreground">
              M
            </div>
            <span className="font-bold text-sm tracking-tight">MAga</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {item.category}
                </span>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              <p className="text-sm text-muted-foreground">
                Listed by{" "}
                <span className="font-medium text-foreground">
                  {item.ownerName}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-card/40">
              <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Description
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Comments ({comments?.length || 0})
              </h3>
              <div className="space-y-3 mb-4">
                {comments === undefined ? (
                  <p className="text-xs text-muted-foreground">Loading…</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No comments yet. Be the first.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-lg bg-muted/40 border border-border/40"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {c.authorName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment…"
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleComment}
                  disabled={!comment.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="p-4 rounded-xl border border-border/60 bg-card/60">
              <div className="text-3xl font-bold text-primary mb-1">
                ${item.price}
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">
                per session
              </p>

              {!isOwner ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                        Time
                      </label>
                      <Input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
                        Minutes
                      </label>
                      <Input
                        type="number"
                        value={bookingDuration}
                        onChange={(e) => setBookingDuration(e.target.value)}
                        className="h-8 text-xs"
                        min="15"
                        step="15"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleBook}
                    disabled={
                      bookingLoading || !bookingDate || !bookingTime
                    }
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {bookingLoading ? "Booking…" : "Book Session"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This is your item. Others can book sessions with you.
                </p>
              )}
            </div>

            {/* Upcoming bookings */}
            {bookings && bookings.length > 0 && (
              <div className="p-4 rounded-xl border border-border/60 bg-card/60">
                <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Upcoming Sessions
                </h3>
                <div className="space-y-2">
                  {bookings.slice(0, 5).map((b) => (
                    <div
                      key={b._id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(b.startTime).toLocaleDateString()}{" "}
                          {new Date(b.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {b.paymentStatus === "paid" ? (
                            <span className="text-green-500">Paid</span>
                          ) : (
                            <span className="text-yellow-500">Unpaid</span>
                          )}{" "}
                          · ${b.amount}
                        </p>
                      </div>
                      {b.paymentStatus === "unpaid" && !isOwner && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px]"
                          onClick={() => handlePay(b._id)}
                          disabled={paying}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                <h3 className="text-xs font-medium text-destructive mb-2 uppercase tracking-wider">
                  Owner Actions
                </h3>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    await removeItem({ itemId: itemId! });
                    navigate("/dashboard");
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Remove Listing
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
