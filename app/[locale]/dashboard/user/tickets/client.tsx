"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Clock, AlertCircle } from "lucide-react";

type Props = {
  locale: string;
  initialTickets: any[];
};

export default function TicketsClient({ locale, initialTickets }: Props) {
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("high");
  const [message, setMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = locale === "ar";

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/user/tickets?locale=${locale}`);
      const data = await res.json();
      if (res.ok) {
        setTickets(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "حجم الملف يجب أن يكون أقل من 10 ميجا بايت" : "File size should be less than 10MB");
      return;
    }
    setAttachmentFile(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error(isAr ? "الرجاء إدخال موضوع التذكرة" : "Please enter the ticket subject");
      return;
    }
    if (!message.trim()) {
      toast.error(isAr ? "الرجاء إدخال نص الرسالة" : "Please enter the message content");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("priority", priority);
      if (attachmentFile) {
        formData.append("file", attachmentFile);
      }

      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: {
          "Accept-Language": locale,
        },
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to create ticket");
      }

      toast.success(isAr ? "تم إنشاء التذكرة بنجاح" : "Ticket created successfully");
      setShowNewTicketModal(false);
      
      // Reset form
      setSubject("");
      setMessage("");
      setPriority("high");
      setAttachmentFile(null);

      // Refresh list
      await fetchTickets();
    } catch (err: any) {
      console.error("[Create ticket error]", err);
      toast.error(err.message || (isAr ? "فشل إنشاء التذكرة" : "Failed to create ticket"));
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityLabel = (pri: string) => {
    const map: Record<string, string> = {
      high: isAr ? "عالي" : "High",
      medium: isAr ? "متوسط" : "Medium",
      low: isAr ? "منخفض" : "Low",
    };
    return map[pri] || pri;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: isAr ? "معلق" : "Pending",
      open: isAr ? "مفتوح" : "Open",
      closed: isAr ? "مغلق" : "Closed",
      rejected: isAr ? "مرفوض" : "Rejected",
    };
    return map[status] || status;
  };

  const getFilenameFromUrl = (url?: string | null) => {
    if (!url) return "";
    return url.substring(url.lastIndexOf("/") + 1);
  };

  const formatLastReply = (dateStr?: string) => {
    if (!dateStr) return isAr ? "منذ فترة" : "some time ago";
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins} minutes ago`;
      }
      if (diffHours < 24) {
        return isAr ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
      }
      if (diffDays < 30) {
        return isAr ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
      }
      return isAr ? "منذ شهر" : "1 month ago";
    } catch {
      return isAr ? "منذ شهر" : "1 month ago";
    }
  };

  const gradientTitleClasses = cn(
    "bg-clip-text text-transparent font-bold",
    isAr ? "bg-gradient-to-r" : "bg-gradient-to-l",
    "from-[#032C44] to-[#41A0CA]"
  );

  return (
    <div className="w-full space-y-6 max-w-[1000px] mx-auto pb-10" dir={isAr ? "rtl" : "ltr"}>
      {/* Header with "+ New Ticket" button */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-[20px]", gradientTitleClasses)}>
            {isAr ? "الدعم الفني والتذاكر" : "Tickets & Support"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAr
              ? "يمكنك إرسال استفساراتك ومتابعة الردود من هنا"
              : "Send your inquiries and track replies in one place"}
          </p>
        </div>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-b from-[#006EA8] to-[#005685] text-white hover:brightness-105 rounded-[8px] text-[14px] font-semibold transition shadow-[0px_4px_12px_rgba(0,110,168,0.25)] cursor-pointer"
        >
          <span className="text-[16px] font-bold">+</span>
          <span>{isAr ? "تذكرة جديدة" : "New Ticket"}</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => {
            const lastUpdated = ticket.updated_at || ticket.created_at;
            const status = ticket.status || "pending";
            const attachment = ticket.file || ticket.attachment;

            return (
              <div
                key={ticket.id}
                className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px] font-bold text-[#032C44]">
                        {ticket.subject}
                      </h3>
                      {/* Priority badge */}
                      <span className="bg-[#005685] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                        {getPriorityLabel(ticket.priority || "high")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {isAr ? "آخر رد:" : "Last Reply:"} {formatLastReply(lastUpdated)}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={cn(
                      "text-[11px] font-bold px-3 py-1 rounded-full border shrink-0",
                      status === "pending" && "border-[#FFB64D] bg-[#FFF8EE] text-[#FFB64D]",
                      status === "open" && "border-[#39DA8A] bg-[#EAFBF3] text-[#39DA8A]",
                      status === "closed" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]",
                      status === "rejected" && "border-[#FF5B5C] bg-[#FFF5F5] text-[#FF5B5C]"
                    )}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>

                {/* Message body */}
                <p className="text-[14px] text-gray-600 leading-relaxed line-clamp-2">
                  {ticket.message}
                </p>

                {/* Attachment Link if exists */}
                {attachment && (
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-[#006EA8] truncate">
                    <img src="/portfolio/pdf.svg" alt="File Icon" className="w-5 h-5 flex-shrink-0" />
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-semibold hover:underline"
                    >
                      {getFilenameFromUrl(attachment)}
                    </a>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <img src="/portfolio/drop.svg" alt="Empty" className="w-16 h-16 mx-auto opacity-40 mb-4" />
            <p className="text-gray-500 font-medium">
              {isAr ? "لا توجد تذاكر دعم فني مفتوحة حالياً" : "No support tickets open at the moment"}
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NEW TICKET MODAL */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={showNewTicketModal} onOpenChange={setShowNewTicketModal}>
        <DialogContent className="max-w-[550px] p-6 rounded-[20px] bg-white border-0 shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <DialogTitle className={gradientTitleClasses}>
              {isAr ? "تذكرة جديدة" : "New Ticket"}
            </DialogTitle>
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <img src="/portfolio/close-circle.svg" alt="Close" className="w-7 h-7" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject and Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "الموضوع *" : "Subject *"}
                </label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isAr ? "موضوع التذكرة" : "Ticket Subject"}
                  className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold text-[#032C44]">
                  {isAr ? "الأولوية *" : "Priority *"}
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="appearance-none border border-[#E5E7EB] focus:border-[#40A0CA] bg-white rounded-[8px] px-3 py-2 pr-8 text-sm w-full outline-none"
                  >
                    <option value="high">{isAr ? "عالي" : "High"}</option>
                    <option value="medium">{isAr ? "متوسط" : "Medium"}</option>
                    <option value="low">{isAr ? "منخفض" : "Low"}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <img src="/portfolio/arrow-down.svg" alt="Select" className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "نص الرسالة *" : "Message *"}
              </label>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isAr ? "اكتب تفاصيل المشكلة أو الاستفسار هنا..." : "Write details about your issue here..."}
                className="border border-[#E5E7EB] focus:border-[#40A0CA] rounded-[8px] px-3 py-2 text-sm w-full outline-none resize-none"
              />
            </div>

            {/* File Drag and Drop Zone */}
            <div className="space-y-1">
              <label className="text-[14px] font-bold text-[#032C44]">
                {isAr ? "المرفقات" : "Attachments"}
              </label>
              <div
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] hover:bg-[#EBF7FF] transition rounded-[12px] py-8 px-4 flex flex-col items-center justify-center cursor-pointer text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <img src="/portfolio/drop.svg" alt="Upload" className="w-[42px] h-[42px] mb-2" />
                <p className="text-[#032C44] text-[13px] font-medium">
                  {attachmentFile ? (
                    <span className="text-[#006EA8]">{attachmentFile.name}</span>
                  ) : isAr ? (
                    <>قم بسحب الملف هنا، أو <span className="text-[#006EA8] underline">تصفح</span></>
                  ) : (
                    <>Drop a file, or <span className="text-[#006EA8] underline">browse</span></>
                  )}
                </p>
                <p className="text-[#6B7280] text-[10px] mt-1.5">
                  {isAr
                    ? "حجم الملف أقل من 10MB وصيغ الملفات المقبولة pdf, png, jpg, jpeg"
                    : "File size should be less than 10MB and file type should be jpg, jpeg, png, pdf"}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="px-10 h-[44px] border border-[#006EA8] text-[#006EA8] bg-white hover:bg-[#F0F9FF] font-bold rounded-[12px] text-[15px] transition cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <PrimaryButton
                type="submit"
                disabled={submitting}
                className="px-10 w-auto cursor-pointer"
              >
                {isAr ? "إرسال التذكرة" : "Submit"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
