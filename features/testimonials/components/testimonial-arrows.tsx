import { cn } from "@/lib/utils"

type ArrowProps = {
  className?: string
  flip?: boolean
}

/** Light arrow — previous (Figma #C2DDFF) */
export function TestimonialArrowPrev({ className, flip }: ArrowProps) {
  return (
    <svg
      width="101"
      height="15"
      viewBox="0 0 101 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[15px] w-[100px] max-w-[100px] shrink-0", flip && "scale-x-[-1]", className)}
      aria-hidden
    >
      <path
        d="M0.292892 8.07088C-0.0976334 7.68035 -0.0976334 7.04719 0.292892 6.65666L6.65685 0.292702C7.04738 -0.0978227 7.68054 -0.0978227 8.07107 0.292702C8.46159 0.683226 8.46159 1.31639 8.07107 1.70692L2.41422 7.36377L8.07107 13.0206C8.46159 13.4111 8.46159 14.0443 8.07107 14.4348C7.68054 14.8254 7.04738 14.8254 6.65685 14.4348L0.292892 8.07088ZM101 7.36377V8.36377H1V7.36377V6.36377H101V7.36377Z"
        fill="#C2DDFF"
      />
    </svg>
  )
}

/** Dark arrow — next (Figma #002B46) */
export function TestimonialArrowNext({ className, flip }: ArrowProps) {
  return (
    <svg
      width="101"
      height="15"
      viewBox="0 0 101 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[15px] w-[100px] max-w-[100px] shrink-0", flip && "scale-x-[-1]", className)}
      aria-hidden
    >
      <path
        d="M100.707 8.07088C101.098 7.68035 101.098 7.04719 100.707 6.65666L94.3431 0.292702C93.9526 -0.0978227 93.3195 -0.0978227 92.9289 0.292702C92.5384 0.683226 92.5384 1.31639 92.9289 1.70692L98.5858 7.36377L92.9289 13.0206C92.5384 13.4111 92.5384 14.0443 92.9289 14.4348C93.3195 14.8254 93.9526 14.8254 94.3431 14.4348L100.707 8.07088ZM0 7.36377V8.36377H100V7.36377V6.36377H0V7.36377Z"
        fill="#002B46"
      />
    </svg>
  )
}
