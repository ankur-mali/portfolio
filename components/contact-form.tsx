"use client";

import React, { useRef } from "react";
import toast from "react-hot-toast";
import { useFormStatus } from "react-dom";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";

type Variant = "plain" | "letter";

/** Wax-seal submit button for the letter variant. */
function SealButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-wine-600 disabled:opacity-70"
    >
      <span className="wax-seal grid h-14 w-14 place-items-center rounded-full font-display text-2xl font-semibold text-[#fff6e6] transition-transform group-hover:-rotate-12 group-hover:scale-105 group-active:scale-95">
        {pending ? <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-[#f6dcae]" /> : "A"}
      </span>
      <span className="font-hand text-2xl text-[#5a3b22] underline-offset-4 group-hover:underline">
        {pending ? "Sealing…" : "Seal & send"}
      </span>
    </button>
  );
}

function LetterFields() {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="letter-paper relative -rotate-[0.6deg] rounded-[3px] px-5 pb-5 pt-6 text-[#3b2a1c] sm:px-7">
      {/* stamp + postmark */}
      <div aria-hidden className="absolute right-4 top-4 flex items-start">
        <div className="letter-stamp h-[3.8rem] w-[3.1rem]">
          <svg viewBox="0 0 24 30" className="stamp-art block h-full w-full">
            <path d="M4 22l8-9 8 9z" fill="#f4e9d0" />
            <path d="M12 6v3M9.5 9h5l-.5 4h-4z" stroke="#7a2e22" strokeWidth="1.2" fill="#ffcf7a" />
            <text x="12" y="28" textAnchor="middle" fontSize="4.2" fill="#3b2a1c" fontFamily="serif">
              TOWN POST
            </text>
          </svg>
        </div>
        <div className="-ml-5 mt-5 grid h-12 w-12 rotate-12 place-items-center rounded-full border-2 border-[#7a5638]/45 text-center font-display text-[0.5rem] uppercase leading-tight tracking-wider text-[#7a5638]/70">
          Snow
          <br />
          Town
        </div>
      </div>

      <p suppressHydrationWarning className="pr-24 font-display text-xs uppercase tracking-[0.2em] text-[#7a5638]">{today}</p>
      <p className="mt-3 font-hand text-[1.9rem] leading-none">Dear Ankur,</p>

      <label htmlFor="message" className="sr-only">
        Your letter
      </label>
      <textarea
        id="message"
        name="message"
        required
        maxLength={5000}
        placeholder="Write your letter here…"
        className="letter-lines mt-2 h-24 w-full sm:h-40 resize-none bg-transparent font-hand text-[1.45rem] text-[#2c1d10] outline-none placeholder:text-[#7a5638]"
      />

      <p className="mt-3 font-hand text-2xl leading-none">Yours sincerely,</p>
      <div className="mt-2 flex items-baseline gap-2">
        <label htmlFor="senderEmail" className="shrink-0 font-display text-xs uppercase tracking-[0.18em] text-[#7a5638]">
          Reply to
        </label>
        <input
          id="senderEmail"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="your@email.com"
          className="w-full border-b border-dashed border-[#7a5638]/50 bg-transparent pb-0.5 font-hand text-[1.45rem] text-[#2c1d10] outline-none placeholder:text-[#7a5638] focus:border-solid focus:border-[#7a5638]"
        />
      </div>

      <div className="mt-5 flex justify-end">
        <SealButton />
      </div>
    </div>
  );
}

function PlainFields() {
  return (
    <>
      <label className="sr-only" htmlFor="senderEmail">
        Your email
      </label>
      <input
        id="senderEmail"
        className="h-12 rounded-xl border border-stone-900/10 bg-white/90 px-4 outline-none transition focus:border-wine-600 focus:ring-2 focus:ring-wine-500/25"
        name="senderEmail"
        type="email"
        required
        maxLength={500}
        placeholder="Your email"
      />
      <label className="sr-only" htmlFor="message">
        Message
      </label>
      <textarea
        id="message"
        className="h-52 rounded-xl border border-stone-900/10 bg-white/90 p-4 outline-none transition focus:border-wine-600 focus:ring-2 focus:ring-wine-500/25"
        name="message"
        placeholder="Your message"
        required
        maxLength={5000}
      />
      <SubmitBtn />
    </>
  );
}

/** The contact form, shared by the town's mailbox stop (letter) and the classic view (plain). */
export default function ContactForm({ variant = "plain" }: { variant?: Variant }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      className="flex flex-col gap-3 text-stone-900"
      action={async (formData) => {
        const { error } = await sendEmail(formData);
        if (error) {
          toast.error(error);
          return;
        }
        toast.success("Letter delivered! I'll write back soon.");
        formRef.current?.reset();
      }}
    >
      {variant === "letter" ? <LetterFields /> : <PlainFields />}
    </form>
  );
}
