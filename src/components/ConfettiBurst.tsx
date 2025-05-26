
import React, { useEffect } from "react";
import confetti from "canvas-confetti";

// Component: Triggers a one-time confetti burst on mount.
// Usage: Render `<ConfettiBurst />` where you'd like the burst to occur.
export function ConfettiBurst({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (trigger) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.7 },
      });
    }
  }, [trigger]);

  // This component renders nothing visually
  return null;
}
