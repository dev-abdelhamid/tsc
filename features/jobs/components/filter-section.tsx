import Image from "next/image"
import type { ReactNode } from "react"

type FilterSectionProps = {
  title: string
  children: ReactNode
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[20px] leading-[1.2] font-medium text-[#262626] sm:text-[24px]">
          {title}
        </h4>
        <Image
          src="/jobs/icon-chevron-down.svg"
          alt=""
          width={16}
          height={16}
          className="shrink-0"
          aria-hidden
        />
      </div>
      {children}
    </section>
  )
}
