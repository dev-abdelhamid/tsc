"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Trash2, Briefcase } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
  locale: string;
  initialJobs: any[];
};

export default function FavouritesClient({ locale, initialJobs }: Props) {
  const [jobs, setJobs] = useState<any[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const isAr = locale === "ar";
  const isDe = locale === "de";

  const handleDelete = async (jobId: number) => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/favourites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to remove from favorites");
      }

      toast.success(isAr ? "تم إزالة الوظيفة من المفضلة" : isDe ? "Job aus den Favoriten entfernt" : "Job removed from favorites");
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err: any) {
      console.error("[Delete favourite error]", err);
      toast.error(err.message || (isAr ? "فشل إزالة الوظيفة" : isDe ? "Fehler beim Entfernen des Jobs" : "Failed to remove job"));
    } finally {
      setLoading(false);
      setDeleteTargetId(null);
    }
  };

  const getCompanyLogo = (logoUrl?: string | null) => {
    if (!logoUrl) return "/portfolio/job-placeholder.png";
    if (logoUrl.startsWith("http")) return logoUrl;
    return logoUrl;
  };

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold text-xl",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  );

  return (
    <div className="w-full space-y-6 pb-10" dir={isAr ? "rtl" : "ltr"}>
      {/* Page content: list of favourite jobs (header provided by DashboardPageShell) */}

      <div className="w-full">
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const companyName = job.company?.name || "—";
              const categoryName = job.category?.name || job.company?.company_type?.name || "—";
              const location = job.location || "—";
              const logo = getCompanyLogo(job.company?.logo);

              return (
                <div
                  key={job.id}
                  className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between h-full space-y-6"
                >
                  <div className="space-y-4">
                    {/* Top: title and category */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[18px] font-bold text-[#032C44] line-clamp-1">
                        {job.title}
                      </h3>
                      <span className="rounded-full bg-[#006EA8]/10 px-3 py-1 text-xs font-bold text-[#006EA8] shrink-0">
                        {categoryName}
                      </span>
                    </div>

                    {/* Middle: company info and logo */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={logo}
                          alt={companyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/portfolio/job-placeholder.png";
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#032C44]">{companyName}</p>
                        <p className="text-xs text-gray-500">{location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: actions */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 items-center">
                    {/* Delete button */}
                    <button
                      onClick={() => setDeleteTargetId(job.id)}
                      disabled={loading}
                      className="h-[42px] border border-[#FF5B5C] hover:bg-[#FFF5F5] text-[#FF5B5C] rounded-[10px] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isAr ? "حذف" : isDe ? "Löschen" : "Delete"}</span>
                    </button>

                    {/* Details button */}
                    <Link href={`/jobs/${job.id}`} className="w-full flex-1">
                      <PrimaryButton
                        type="button"
                        className="h-[42px] rounded-[10px] text-xs w-full flex items-center justify-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-white inline-block" />
                        <span>{isAr ? "التفاصيل" : isDe ? "Details" : "Details"}</span>
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <img src="/portfolio/drop.svg" alt="Empty" className="w-16 h-16 mx-auto opacity-40 mb-4" />
            <p className="text-gray-500 font-medium">
              {isAr ? "لا توجد وظائف مفضلة حالياً" : isDe ? "Derzeit keine gespeicherten Jobs" : "No saved jobs at the moment"}
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-4 text-xs font-bold text-[#006EA8] hover:underline"
            >
              {isAr ? "تصفح الوظائف المتاحة" : isDe ? "Verfügbare Jobs durchsuchen" : "Browse available jobs"}
            </Link>
          </div>
        )}
      </div>

      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? "تأكيد الحذف" : isDe ? "Löschen bestätigen" : "Confirm Deletion"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "هل أنت متأكد أنك تريد حذف هذه الوظيفة من قائمة المفضلة؟"
                : isDe ? "Sind Sie sicher, dass Sie diesen Job aus Ihren Favoriten löschen möchten?" : "Are you sure you want to delete this job from your favorites?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {isAr ? "إلغاء" : isDe ? "Abbrechen" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTargetId !== null) {
                  handleDelete(deleteTargetId);
                }
              }}
              className="bg-[#FF5B5C] hover:bg-[#E04F50] text-white"
            >
              {loading ? (isAr ? "جاري الحذف..." : isDe ? "Wird gelöscht..." : "Deleting...") : (isAr ? "تأكيد" : isDe ? "Bestätigen" : "Confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}