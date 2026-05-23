import { cn } from "@/lib/utils"

type JobDetailShareProps = {
  label: string
  className?: string
}

const SOCIAL = [
  { name: "Twitter", href: "#", letter: "X" },
  { name: "Facebook", href: "#", letter: "f" },
  { name: "LinkedIn", href: "#", letter: "in" },
] as const

export function JobDetailShare({ label, className }: JobDetailShareProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <span className="text-[16px] font-medium text-[#40A0CA]">{label}</span>
      <div className="flex items-center gap-3">
        {SOCIAL.map((item) => (
          <a
            key={item.name}
            href={item.href}
            aria-label={item.name}
            className="flex size-10 items-center justify-center rounded-full bg-[#40A0CA] text-[14px] font-bold text-white transition hover:bg-[#006EA8]"
          >
            {item.letter}
          </a>
        ))}
      </div>
    </div>
  )
}
