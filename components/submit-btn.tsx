"use client";

import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useFormStatus } from "react-dom";

export default function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="group flex h-12 w-36 items-center justify-center gap-2 rounded-full bg-wine-600 text-wine-50 outline-none transition-all hover:scale-[1.02] hover:bg-wine-700 focus-visible:ring-2 focus-visible:ring-wine-500 active:scale-[0.97] active:duration-75 disabled:scale-100 disabled:opacity-65 dark:bg-wine-300 dark:text-wine-900 dark:hover:bg-wine-200"
      disabled={pending}
    >
      {pending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current"></div>
      ) : (
        <>
          Send{" "}
          <FaPaperPlane className="text-xs opacity-70 transition-all group-hover:-translate-y-1 group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
