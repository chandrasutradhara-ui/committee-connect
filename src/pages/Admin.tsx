import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  CreditCard,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

type AdminTab = "items" | "bookings" | "users";

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>("items");

  const allItems = useQuery(api.items.getAllAdmin);
  const allBookings = useQuery(api.bookings.getAllAdmin);
  const allUsers = useQuery(api.users.getAllUsers);

  const removeItem = useMutation(api.items.remove);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Shield className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Admin access required.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: typeof Package }[] = [
    { key: "items", label: "All Items", icon: Package },
    { key: "bookings", label: "All Bookings", icon: CreditCard },
    { key: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border/50">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Items tab */}
        {tab === "items" && (
          <div>
            <p className="text-xs text-muted-foreground mb-4">
              {allItems === undefined ? "Loading…" : `${allItems.length} total items`}
            </p>
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Owner
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allItems?.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-border/30 hover:bg-accent/30"
                    >
                      <td className="px-4 py-2.5 font-medium">{item.title}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {item.ownerName}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        ${item.price}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            item.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : item.status === "draft"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem({ itemId: item._id })}
                        >
                          <Ban className="w-3 h-3 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings tab */}
        {tab === "bookings" && (
          <div>
            <p className="text-xs text-muted-foreground mb-4">
              {allBookings === undefined
                ? "Loading…"
                : `${allBookings.length} total bookings`}
            </p>
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Booking
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Item
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings?.map((b) => (
                    <tr
                      key={b._id}
                      className="border-b border-border/30 hover:bg-accent/30"
                    >
                      <td className="px-4 py-2.5 font-mono text-[11px]">
                        {b._id.slice(-8)}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px]">
                        {b.itemId.slice(-8)}
                      </td>
                      <td className="px-4 py-2.5">
                        {new Date(b.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        ${b.amount}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            b.status === "confirmed"
                              ? "bg-green-500/10 text-green-500"
                              : b.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : b.status === "cancelled"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            b.paymentStatus === "paid"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div>
            <p className="text-xs text-muted-foreground mb-4">
              {allUsers === undefined
                ? "Loading…"
                : `${allUsers.length + 1} total users`}
            </p>
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      User
                    </th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Current user */}
                  <tr className="border-b border-border/30 bg-primary/5">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                          {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">
                          {user?.name || "You"}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-primary/10 text-primary">
                          admin
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {user?.email || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                        online
                      </span>
                    </td>
                  </tr>
                  {allUsers?.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-border/30 hover:bg-accent/30"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">—</td>
                      <td className="px-4 py-2.5 text-center">
                        {u.online ? (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                            online
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            offline
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
