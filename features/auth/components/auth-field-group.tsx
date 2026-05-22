import type { ReactNode } from "react"

type AuthFieldGroupProps = {
  children: ReactNode
}

export function AuthFieldGroup({ children }: AuthFieldGroupProps) {
  return (
    <div className="flex w-[470px] flex-col gap-6">
      {children}
    </div>
  )
}
