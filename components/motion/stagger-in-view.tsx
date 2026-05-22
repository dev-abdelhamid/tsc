"use client"

import { motion } from "motion/react"
import { cn } from "@/hooks/lib/utils"
import {
  staggerContainerVariants,
  staggerItemVariants,
  staggerViewport,
} from "@/components/motion/stagger-variants"

type StaggerInViewProps = {
  children: React.ReactNode
  className?: string
  /** Extra pause before the first child (e.g. hero above the fold). */
  leadDelay?: number
}

type StaggerItemProps = {
  children: React.ReactNode
  className?: string
}

export function StaggerInView({ children, className, leadDelay = 0.35 }: StaggerInViewProps) {
  const containerVariants = {
    ...staggerContainerVariants,
    visible: {
      ...staggerContainerVariants.visible,
      transition: {
        delayChildren: leadDelay,
        staggerChildren: 0.16,
      },
    },
  }

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={staggerViewport}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div className={cn(className)} variants={staggerItemVariants}>
      {children}
    </motion.div>
  )
}
