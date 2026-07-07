export const dynamic = "force-dynamic";

import LegalUpdatesTicker from "@/components/dashboard/LegalUpdatesTicker";

export default function IntelligenceFeedPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <LegalUpdatesTicker />
      </div>
    </div>
  );
}
