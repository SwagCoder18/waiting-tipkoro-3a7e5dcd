import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/Avatar";
import { Heart, MessageCircle } from "lucide-react";

interface Tip {
  id: string;
  name: string;
  amount: number;
  message?: string;
  avatar: string;
  timestamp: Date;
}

const sampleTips: Omit<Tip, "id" | "timestamp">[] = [
  { name: "Rafi", amount: 50, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" },
  { name: "Tania", amount: 100, message: "Keep up the great work!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { name: "Mithila", amount: 80, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
  { name: "Sabbir", amount: 200, message: "Love your content!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { name: "Nabila", amount: 150, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { name: "Fahim", amount: 75, message: "Supporting from Dhaka!", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop" },
  { name: "Rima", amount: 120, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  { name: "Tanim", amount: 250, message: "You deserve it!", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
];

export function LiveTipsFeed() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with 3 tips
    const initialTips = sampleTips.slice(0, 3).map((tip, index) => ({
      ...tip,
      id: `initial-${index}`,
      timestamp: new Date(Date.now() - (3 - index) * 60000),
    }));
    setTips(initialTips);

    // Add new tip every 4 seconds
    let tipIndex = 3;
    const interval = setInterval(() => {
      const newTip: Tip = {
        ...sampleTips[tipIndex % sampleTips.length],
        id: `tip-${Date.now()}`,
        timestamp: new Date(),
      };
      
      setAnimatingId(newTip.id);
      setTips(prev => [newTip, ...prev.slice(0, 4)]);
      
      setTimeout(() => setAnimatingId(null), 500);
      tipIndex++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm font-medium text-muted-foreground">Live Tips</span>
      </div>
      <div className="flex flex-col gap-3 overflow-hidden">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className={`flex items-start gap-3 rounded-xl bg-background p-3 shadow-sm transition-all duration-500 ease-out ${
              animatingId === tip.id 
                ? "animate-fade-in opacity-100" 
                : "opacity-100"
            }`}
          >
            <Avatar size="small" image={tip.avatar}>
              {tip.name[0]}
            </Avatar>
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground">{tip.name}</span>
                <span className="text-sm text-muted-foreground">tipped</span>
                <span className="font-bold text-sm text-primary">{tip.amount}৳</span>
                {tip.message ? (
                  <MessageCircle className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />
                )}
              </div>
              {tip.message && (
                <p className="text-xs text-muted-foreground truncate">"{tip.message}"</p>
              )}
              <span className="text-xs text-muted-foreground/60">{formatTime(tip.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
