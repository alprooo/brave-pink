import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "cyan" | "pink" | "purple" | "blue" | "green"; // add more if needed
}

export function Button({ color = "cyan", className, children, ...props }: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-full px-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

  const colorVariants: Record<string, string> = {
    cyan: "bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-400",
    pink: "bg-pink-500 hover:bg-pink-600 text-white focus:ring-pink-400",
    purple: "bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400",
    blue: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400",
    green: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-400",
  };

  return (
    <button
      className={`${baseClasses} ${colorVariants[color]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
