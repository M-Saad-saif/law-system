"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import WelcomeModal from "@/components/layout/Welcomemodal";
import SeniorWelcomeModal from "@/components/layout/SeniorWelcomeModal";

export default function WelcomeGate() {
  const { user, refetch } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (user && !user.hasSeenWelcome && user.role !== "admin") {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    refetch();
  };

  if (user?.seniority === "senior") {
    return <SeniorWelcomeModal user={user} onDismiss={handleDismiss} />;
  }

  return <WelcomeModal user={user} onDismiss={handleDismiss} />;
}
