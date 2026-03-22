export function TweetPreview({
  body,
  account,
}: {
  body: string;
  account: "business" | "personal";
}) {
  const name = account === "business" ? "Azen AI" : "Tayyib";
  const handle = account === "business" ? "@azen_ai" : "@tayyib_ai";

  return (
    <div className="bg-black border border-[#2f3336] rounded-xl max-w-[400px] mx-auto p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {name[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-bold">{name}</span>
            <span className="text-[#71767b] text-sm">{handle}</span>
            <span className="text-[#71767b] text-sm">· Now</span>
          </div>
          <div className="text-white text-sm leading-relaxed mt-1 whitespace-pre-wrap">
            {body}
          </div>
          <div className="flex justify-between mt-3 text-[#71767b] text-xs max-w-[300px]">
            <span>Reply</span>
            <span>Repost</span>
            <span>Like</span>
            <span>Views</span>
            <span>Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}
