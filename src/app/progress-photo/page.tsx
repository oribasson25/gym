"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/Input";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";
import { he } from "date-fns/locale";

type Photo = {
  id: string;
  photoUrl: string;
  monthYear: string;
  takenAt: string;
  weightKg: number | null;
};

export default function ProgressPhotoPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preview, setPreview] = useState("");
  const [photoBase64, setPhotoBase64] = useState("");
  const [weightKg, setWeightKg] = useState(75);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alreadyUploaded, setAlreadyUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/progress-photos")
      .then((r) => r.json())
      .then((d) => {
        setPhotos(d.photos ?? []);
        const currentMonth = format(new Date(), "yyyy-MM");
        if (d.photos?.some((p: Photo) => p.monthYear === currentMonth)) {
          setAlreadyUploaded(true);
        }
      });
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoBase64(base64);
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!photoBase64) return;
    setLoading(true);

    const res = await fetch("/api/progress-photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoBase64, weightKg, notes }),
    });

    if (res.ok) {
      setSaved(true);
      const data = await res.json();
      setPhotos((prev) => [data.photo, ...prev]);
    }

    setLoading(false);
  };

  const currentMonth = format(new Date(), "MMMM yyyy", { locale: he });
  const prevPhoto = photos[0];
  const newPhoto = photos.find(
    (p) => p.monthYear === format(new Date(), "yyyy-MM")
  );

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">תמונות תקדמות</h1>
          <p className="text-slate-400 text-sm">{currentMonth}</p>
        </div>

        {/* Upload section */}
        {!alreadyUploaded || saved ? (
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {saved ? "✓ תמונה הועלתה!" : "העלה תמונת חודש"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                לפני הארוחה הראשונה · אותה תאורה ועמדה
              </p>
            </div>

            {!saved && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />

                <button
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "w-full h-52 rounded-3xl border-2 border-dashed",
                    "flex flex-col items-center justify-center gap-3",
                    "transition-all duration-150 active:scale-[0.98]",
                    preview
                      ? "border-primary"
                      : "border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  )}
                >
                  {preview ? (
                    <div className="relative w-full h-full rounded-3xl overflow-hidden">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <>
                      <span className="text-4xl">📷</span>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">לחץ לבחירת תמונה</p>
                    </>
                  )}
                </button>

                <NumberInput
                  label="משקל היום (אופציונלי)"
                  value={weightKg}
                  onChange={setWeightKg}
                  min={30}
                  max={300}
                  step={0.1}
                  suffix="ק״ג"
                />

                <Button
                  fullWidth
                  loading={loading}
                  disabled={!photoBase64}
                  onClick={handleSubmit}
                >
                  שמור תמונה ✓
                </Button>
              </>
            )}
          </Card>
        ) : (
          <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <p className="font-bold text-primary">תמונת החודש הועלתה</p>
                <p className="text-sm text-primary/70">נראה אותך בחודש הבא</p>
              </div>
            </div>
          </Card>
        )}

        {/* Photos grid */}
        {photos.length >= 2 && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">השוואה</h3>
            <div className="grid grid-cols-2 gap-3">
              {[photos[1], photos[0]].map((photo, i) => (
                <div key={photo.id} className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium text-center">
                    {i === 0 ? "חודש שעבר" : "החודש"}
                    {photo.weightKg && ` · ${photo.weightKg} ק״ג`}
                  </p>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <Image
                      src={photo.photoUrl}
                      alt={`Progress ${photo.monthYear}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All photos */}
        {photos.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">כל התמונות</h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="space-y-1">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <Image
                      src={photo.photoUrl}
                      alt={`Progress ${photo.monthYear}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    {format(new Date(photo.takenAt), "MMM yy", { locale: he })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
