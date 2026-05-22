import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

type FilterSectionProps = {
  title: string
  children: ReactNode
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[31px] leading-[1.05] font-medium text-[#262626]">{title}</h4>
        <ChevronDown className="h-4 w-4 text-[#63b2da]" />
      </div>
      {children}
    </section>
  )
}
