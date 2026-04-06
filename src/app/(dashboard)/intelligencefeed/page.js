export const dynamic = "force-dynamic";

import IntelligenceFeed from "@/components/dashboard/IntelligenceFeed";

export default function IntelligenceFeedPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <IntelligenceFeed />
      </div>
    </div>
  );
}
