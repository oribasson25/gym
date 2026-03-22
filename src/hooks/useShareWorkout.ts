"use client";

import { RefObject, useState, useCallback } from "react";

export function useShareWorkout(cardRef: RefObject<HTMLDivElement | null>) {
  const [isGenerating, setIsGenerating] = useState(false);

  const shareWorkout = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) return;

      const file = new File([blob], "workout.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workout.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled share or error
    } finally {
      setIsGenerating(false);
    }
  }, [cardRef]);

  return { shareWorkout, isGenerating };
}
