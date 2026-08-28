import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
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
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/8 to-transparent rounded-full blur-3xl" />

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Video className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              SocialConnect
            </span>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </motion.nav>

        {/* Hero content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 mb-6">
              <Zap className="w-3 h-3" />
              Built for committees
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Your committee,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/70 to-primary bg-clip-text text-transparent">
              always connected
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Video calls, instant messaging, and real-time collaboration — all in
            one place. Talk to your committee members face-to-face or chat
            anytime.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="rounded-full px-8 text-base font-semibold h-12"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base h-12"
              onClick={() => navigate("/auth?returnTo=/dashboard")}
            >
              I already have an account
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="mt-16 flex items-center justify-center gap-12 text-sm text-muted-foreground"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">HD Video</p>
              <p>Crystal clear calls</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">Real-time</p>
              <p>Instant messaging</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">Free</p>
              <p>No hidden costs</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your committee needs
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Simple, powerful tools to keep your team connected and productive.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Video,
                title: "Video Calls",
                description:
                  "Face-to-face conversations with crystal-clear HD video. Start a call with any online member instantly.",
              },
              {
                icon: MessageCircle,
                title: "Instant Chat",
                description:
                  "Send messages in real-time. Start conversations, share updates, and keep the discussion going.",
              },
              {
                icon: Users,
                title: "Member Directory",
                description:
                  "See who's online at a glance. Know when your committee members are available to connect.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description:
                  "End-to-end encrypted communication. Your committee discussions stay within the team.",
              },
              {
                icon: Zap,
                title: "Instant Setup",
                description:
                  "No downloads needed. Sign in and start communicating in seconds right from your browser.",
              },
              {
                icon: ArrowRight,
                title: "Always Available",
                description:
                  "Works on any device with a browser. Desktop, tablet, or mobile — connect from anywhere.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="group p-6 rounded-2xl border border-border/60 bg-card/50 hover:bg-card hover:border-border transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-primary/5 border border-border/60"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Ready to connect?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join your committee on SocialConnect. It's free and takes just a
            moment to get started.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 text-base font-semibold h-12"
            onClick={() => navigate("/auth")}
          >
            Start Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Video className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">SocialConnect</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for committee collaboration
          </p>
        </div>
      </footer>
    </div>
  );
}
