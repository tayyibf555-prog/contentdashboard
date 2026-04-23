"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  const sizeClasses = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Click on backdrop (the dialog element itself, not children) closes the modal
        if (e.target === dialogRef.current) onClose();
      }}
      className={`
        ${sizeClasses} w-[calc(100%-2rem)]
        bg-transparent p-0 mx-auto my-auto
        backdrop:bg-black/70 backdrop:backdrop-blur-sm
        open:animate-scale-in
      `}
    >
      {/* Card surface — we keep this as a wrapper so the dialog backdrop click works */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-xl bg-azen-surface border border-azen-line-strong shadow-pop overflow-hidden"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azen-accent/70 to-transparent" />
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-azen-line">
          <div>
            <h3 className="text-white text-[17px] font-semibold leading-tight tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 -mr-1 -mt-1 inline-flex items-center justify-center rounded-md text-azen-text hover:text-white hover:bg-azen-surface-2 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </dialog>
  );
}
