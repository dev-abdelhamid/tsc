import { cn } from "@/lib/utils"

type JobDetailShareProps = {
  label: string
  className?: string
}

export function JobDetailShare({ label, className }: JobDetailShareProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <span className="text-[16px] font-medium text-[#40A0CA]">{label}</span>
      <div className="flex items-center gap-3">
        {/* Twitter / X */}
        <a
          href="#"
          aria-label="Twitter"
          className="flex size-10 items-center justify-center rounded-full bg-[#40A0CA] text-white transition-all duration-200 hover:scale-105 hover:bg-[#006EA8]"
        >
          <svg className="size-[18px] fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* Facebook */}
        <a
          href="#"
          aria-label="Facebook"
          className="flex size-10 items-center justify-center rounded-full bg-[#40A0CA] text-white transition-all duration-200 hover:scale-105 hover:bg-[#006EA8]"
        >
          <svg className="size-[18px] fill-current" viewBox="0 0 24 24">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="#"
          aria-label="LinkedIn"
          className="flex size-10 items-center justify-center rounded-full bg-[#40A0CA] text-white transition-all duration-200 hover:scale-105 hover:bg-[#006EA8]"
        >
          <svg className="size-[18px] fill-current" viewBox="0 0 24 24">
            <path d="M19.5 3h-15C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM9 17H6.5v-7H9v7zM7.75 8.92c-.77 0-1.39-.62-1.39-1.39 0-.77.62-1.39 1.39-1.39.77 0 1.39.62 1.39 1.39 0 .77-.62 1.39-1.39 1.39zm10.25 8.08H15.5v-3.5c0-.88-.02-2-1.22-2-1.22 0-1.4 1-.18 2H13v3.5h-2.5v-7H13v1h.03c.35-.66 1.2-1.35 2.47-1.35 2.64 0 3.13 1.74 3.13 4v3.35z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
