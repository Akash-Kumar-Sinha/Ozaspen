"use client";
import { motion } from "framer-motion";
import React from "react";
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const JoinButton = ({ label, onClick, disabled }: ButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0.95 }}
      whileHover={{ scale: 1.02, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-[24px] h-12 px-6 bg-black text-white font-medium text-sm tracking-wide shadow-md transition-shadow duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed border border-purple-500/30 hover:bg-purple-500/10 ${
        disabled
          ? "shadow-[rgba(0,0,0,0.5)_0_1px_3px_0,_rgba(0,0,0,0.35)_0_4px_8px_3px]"
          : " hover:text-white hover:shadow-[0_6px_18px_0_rgba(139,92,246,0.18)] focus:outline-none focus:ring-2 focus:ring-purple-500"
      }`}
    >
      {label}
    </motion.button>
  );
};

export default JoinButton;
