import type { Variants } from "motion/react"

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.35,
      staggerChildren: 0.16,
    },
  },
}

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotate: -2,
    skewY: 1,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    skewY: 0,
    transition: {
      opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      y: { type: "spring", damping: 26, stiffness: 48, mass: 1.05 },
      rotate: { type: "spring", damping: 26, stiffness: 48, mass: 1.05 },
      skewY: { type: "spring", damping: 26, stiffness: 48, mass: 1.05 },
    },
  },
}

/** Wait until ~half the block is on-screen; shrink bottom edge so it does not fire while still below the fold. */
export const staggerViewport = {
  once: true,
  amount: 0.5,
  margin: "0px 0px -8% 0px",
} as const
