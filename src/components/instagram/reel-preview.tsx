"use client";

type ReelPreviewProps = {
  title: string;
  hook: string | null;
  onScreenText: string[];
};

export function ReelPreview({ title, hook, onScreenText }: ReelPreviewProps) {
  return (
    <div className="w-[280px] bg-black rounded-[2rem] p-3 mx-auto">
      <div className="bg-azen-bg rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-azen-accent/20 flex items-center justify-center text-white text-[10px] font-bold">
            T
          </div>
          <span className="text-white text-[11px] font-semibold">tayyib.ai</span>
          <span className="ml-auto text-white text-[10px] font-semibold">Reel</span>
        </div>
        <div className="aspect-[9/16] bg-gradient-to-b from-azen-card to-azen-bg relative flex flex-col justify-end p-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-white/20 text-[10px] uppercase tracking-widest mb-2">Record This</div>
              <div className="text-white text-sm font-bold leading-snug">{hook || title}</div>
            </div>
          </div>
          {onScreenText.length > 0 && (
            <div className="relative z-10 space-y-1">
              {onScreenText.slice(0, 2).map((text, i) => (
                <div key={i} className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-white text-[10px] font-semibold inline-block">
                  {text}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 px-3 py-2 text-azen-text text-lg">
          <span>&#9825;</span>
          <span>&#9900;</span>
          <span>&#10148;</span>
        </div>
      </div>
    </div>
  );
}
