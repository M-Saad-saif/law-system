import { useState, useEffect } from "react";
import { api } from "@/utils/api";

export function useAIStatus() {
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiChecking, setAiChecking] = useState(true);

  useEffect(() => {
    api
      .get("/api/ai-status")
      .then((res) => setAiAvailable(res.data?.available === true))
      .catch(() => setAiAvailable(false))
      .finally(() => setAiChecking(false));
  }, []);

  return { aiAvailable, aiChecking };
}
