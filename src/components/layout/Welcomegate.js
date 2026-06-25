"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import WelcomeModal from "@/components/layout/Welcomemodal";

export default function WelcomeGate() {
  const { user, refetch } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user?.seniority === "junior" && !user?.hasSeenWelcome) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user]);

  if (!visible) return null;

  return (
    <WelcomeModal
      user={user}
      onDismiss={() => {
        setVisible(false);
        refetch();
      }}
    />
  );
}