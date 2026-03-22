"use client";

import { useEffect, useRef } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="bg-azen-card border border-azen-border rounded-lg p-6 max-w-lg w-full backdrop:bg-black/50"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <button onClick={onClose} className="text-azen-text hover:text-white text-xl">
          x
        </button>
      </div>
      {children}
    </dialog>
  );
}
