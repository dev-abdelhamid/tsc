import { Link } from "@/i18n/navigation"

type SideLinkProps = {
  href: string
  label: string
}

export function AuthSideLink({ href, label }: SideLinkProps) {
  return (
    <div className="text-right">
      <Link className="text-sm leading-[21px] font-medium text-[#40a0ca]" href={href}>
        {label}
      </Link>
    </div>
  )
}
