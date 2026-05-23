import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { NewsExportIcon } from "@/features/news/components/news-icons"

type NewsReadMoreButtonProps = {
  href: string
  label: string
  className?: string
}

export function NewsReadMoreButton({ href, label, className }: NewsReadMoreButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[52px] w-[220px] items-center justify-center gap-2 rounded-xl",
        "bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)]",
        "bg-size-[120px_120px,auto] bg-blend-[plus-lighter,normal] px-4 text-[16px] font-medium text-white",
        "shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#E8F2FF,0_4px_5px_rgba(0,86,133,0.15),0_10px_13px_rgba(0,86,133,0.22),0_24px_32px_rgba(0,86,133,0.19)]",
        "transition-[filter] hover:brightness-105",
        className
      )}
    >
      <NewsExportIcon />
      <span>{label}</span>
    </Link>
  )
}
