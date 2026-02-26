"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20",
  secondary:
    "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700/60",
  danger:
    "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20",
  ghost: "text-gray-400 hover:text-white hover:bg-gray-800/60",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    gsap.to(btnRef.current, {
      scale: 1.04,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.inOut",
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(btnRef.current, {
      scale: 0.95,
      duration: 0.08,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });
    props.onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
