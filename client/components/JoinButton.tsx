"use client";
import { motion } from "framer-motion";
import React from "react";
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const JoinButton = ({
  label,
  onClick,
  disabled,
  className = "",
}: ButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0.95 }}
      whileHover={{ scale: 1.02, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-[24px] h-12 px-6 bg-background text-foreground font-medium text-sm tracking-wide shadow-md transition-shadow duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed border border-primary/30 hover:bg-primary/10 ${className}${
        disabled
          ? ""
          : " hover:text-foreground hover:shadow-[0_6px_18px_0_rgba(147,51,234,0.18)] focus:outline-none focus:ring-2 focus:ring-primary"
      }`}
    >
      {label}
    </motion.button>
  );
};

export default JoinButton;
