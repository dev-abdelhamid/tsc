import type { ReactNode } from "react"

type AuthFieldGroupProps = {
  children: ReactNode
}

export function AuthFieldGroup({ children }: AuthFieldGroupProps) {
  return (
    <div className="flex w-full max-w-[470px] flex-col gap-6 px-2 sm:px-0">
      {children}
    </div>
  )
}
