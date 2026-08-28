import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  MessageCircle,
  Package,
  Search,
  Shield,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground">
            M
          </div>
          <span className="text-lg font-bold tracking-tight">MAga</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-full text-sm"
            onClick={() => navigate("/catalog")}
          >
            Browse
          </Button>
          <Button
            variant="outline"
            className="rounded-full text-sm"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-accent/8 to-transparent rounded-full blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-28 text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6">
              <Zap className="w-3 h-3" />
              v1.0 — Ship faster, together
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
          >
            The catalog platform
            <br />
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-transparent">
              for your committee
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            List services, book sessions, chat in real time, and video call — all
            from one place. Built for teams that ship.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="rounded-full px-8 font-semibold h-12"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full px-8 h-12"
              onClick={() => navigate("/catalog")}
            >
              Browse Catalog
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Browse, book, pay, chat, and call — a complete workspace for
              committees.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              {
                icon: Search,
                title: "Browse & Search",
                desc: "Explore the catalog with full-text search and category filters.",
              },
              {
                icon: Package,
                title: "List Services",
                desc: "Post your own items with pricing, descriptions, and availability.",
              },
              {
                icon: Calendar,
                title: "Book Sessions",
                desc: "Schedule time with any provider. Conflict detection built in.",
              },
              {
                icon: CreditCard,
                title: "Secure Checkout",
                desc: "Pay for bookings with integrated payment processing.",
              },
              {
                icon: Video,
                title: "Video Calls",
                desc: "Crystal-clear WebRTC calls right from the platform.",
              },
              {
                icon: MessageCircle,
                title: "Real-Time Chat",
                desc: "Message any member instantly. Call history in every thread.",
              },
              {
                icon: Users,
                title: "Member Directory",
                desc: "See who's online. Start conversations or calls in one click.",
              },
              {
                icon: Shield,
                title: "Admin Panel",
                desc: "Manage the entire catalog, users, and bookings from one view.",
              },
              {
                icon: Zap,
                title: "Instant Setup",
                desc: "Sign in and go. No downloads, no installs, no friction.",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="group p-5 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-primary/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-border/60 bg-gradient-to-br from-card to-primary/5"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to ship?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join MAga and start listing, booking, and collaborating with your
            committee today.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 font-semibold h-12"
            onClick={() => navigate("/auth")}
          >
            Create Account
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
              M
            </div>
            <span className="font-semibold text-xs">MAga</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">
            v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}
