import { PlatformBadge, PillarBadge, StatusBadge } from "@/components/ui/badge";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

type PostDetailsProps = {
  platform: string;
  account: "business" | "personal";
  pillar: string | null;
  status: string;
  bestTime: string | null;
  contentType: string;
  sourceReference: string | null;
};

export function PostDetails({ platform, account, pillar, status, bestTime, contentType, sourceReference }: PostDetailsProps) {
  const pillars = account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillarData = pillars.find((p) => p.key === pillar);
  const handle = account === "business" ? "@azen_ai" : "@tayyib.ai";

  return (
    <div className="space-y-2.5 mb-4">
      <div className="text-azen-text text-[11px] uppercase tracking-wider">Post Details</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-azen-text">Platform: </span>
          <PlatformBadge platform={platform} />
        </div>
        <div>
          <span className="text-azen-text">Account: </span>
          <span className="text-white">{handle}</span>
        </div>
        <div>
          <span className="text-azen-text">Type: </span>
          <span className="text-white">{contentType}</span>
        </div>
        <div>
          <span className="text-azen-text">Status: </span>
          <StatusBadge status={status} />
        </div>
        {pillarData && (
          <div>
            <span className="text-azen-text">Pillar: </span>
            <PillarBadge label={pillarData.label} color={pillarData.color} />
          </div>
        )}
        {bestTime && (
          <div>
            <span className="text-azen-text">Best Time: </span>
            <span className="text-white font-semibold">{bestTime}</span>
          </div>
        )}
      </div>
      {sourceReference && (
        <div className="text-azen-text text-[10px]">Source: {sourceReference}</div>
      )}
    </div>
  );
}
