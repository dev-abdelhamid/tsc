import type { ReactNode } from "react"
import { authGlowShapes, authGridPattern } from "../auth-theme"

type Props = {
  children: ReactNode
}

export function AuthShell({ children }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#001222]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[#001222]" />

        <div className="absolute inset-0 opacity-35" style={{ backgroundImage: authGridPattern, backgroundSize: "400px 400px" }} />

        {authGlowShapes.map((shape) => (
          <span
            key={shape.id}
            className="absolute rounded-full"
            style={{
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              top: shape.top,
              right: shape.right,
              bottom: shape.bottom,
              left: shape.left,
              opacity: shape.opacity ?? 1,
              background: `radial-gradient(circle at 35% 35%, ${shape.color} 0%, rgba(0,0,0,0) 75%)`,
              filter: `blur(${shape.blur ?? 90}px)`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1512px] items-center justify-center">
        {children}
      </div>
    </main>
  )
}
