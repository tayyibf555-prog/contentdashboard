export function LinkedInPreview({
  body,
  account,
}: {
  body: string;
  account: "business" | "personal";
}) {
  const name = account === "business" ? "Azen AI" : "Tayyib";
  const tagline = account === "business" ? "AI Solutions Agency" : "AI Entrepreneur";

  return (
    <div className="bg-white rounded-lg max-w-[400px] mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {name[0]}
        </div>
        <div>
          <div className="text-[#000000e6] text-sm font-semibold">{name}</div>
          <div className="text-[#00000099] text-[11px]">{tagline}</div>
          <div className="text-[#00000099] text-[10px]">Now</div>
        </div>
      </div>
      {/* Content */}
      <div className="px-4 pb-3 text-[#000000e6] text-xs leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
        {body}
      </div>
      {/* Engagement */}
      <div className="border-t border-[#e0e0e0] px-4 py-2 flex justify-between text-[#00000099] text-[11px]">
        <span>Like</span>
        <span>Comment</span>
        <span>Repost</span>
        <span>Send</span>
      </div>
    </div>
  );
}
