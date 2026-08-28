import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowLeft, Package, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const CATEGORIES = [
  "All",
  "Consulting",
  "Development",
  "Design",
  "Marketing",
  "Education",
  "Creative",
  "Other",
];

export default function Catalog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const items = useQuery(api.items.search, {
    searchTerm: search,
    category: category === "All" ? undefined : category,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center font-bold text-[10px] text-primary-foreground">
              M
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">
              MAga
            </span>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, tags, descriptions…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {items === undefined ? "Loading…" : `${items.length} items`}
          </p>
        </div>

        {items === undefined ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No items found</p>
            <p className="text-xs mt-1">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <button
                key={item._id}
                onClick={() => navigate(`/item/${item._id}`)}
                className="text-left p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-primary/20 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {item.category}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    ${item.price}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    by {item.ownerName}
                  </span>
                  <div className="flex gap-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
