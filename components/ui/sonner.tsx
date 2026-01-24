"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      {...props}
      richColors
      position="top-center"
      toastOptions={{
        classNames: {
          toast: `
            border 
            rounded-md 
            shadow-lg
            ${theme === "dark" ? "bg-neutral-900 text-white border-neutral-700" : "bg-white text-black border-neutral-200"}
          `,
          title: "font-semibold",
          description: `${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`,
          actionButton: `${
            theme === "dark"
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-black text-white hover:bg-neutral-800"
          } rounded px-2 py-1`,
          cancelButton: "opacity-70 hover:opacity-100",
        },
      }}
    />
  );
};