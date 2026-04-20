import { withAuth, apiSuccess } from "@/lib/api";
import { checkAIAvailability } from "@/lib/ai/aiService";

export const GET = withAuth(async () => {
  const status = await checkAIAvailability();

  return apiSuccess(status);
});
