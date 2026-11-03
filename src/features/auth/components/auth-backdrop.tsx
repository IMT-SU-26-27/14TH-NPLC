import Image from "next/image";
import type { AuthBackdropProps, AuthMascot } from "@/types/auth";

// One mascot pose per page (Figma 02 Masuk and 03 Buat akun).
const MASCOT_SRC: Record<AuthMascot, string> = {
  login: "/auth/mascot-login.webp",
  signup: "/auth/mascot-signup.webp",
};
export function AuthBackdrop({ mascot, children }: AuthBackdropProps) {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 pt-28 pb-16">
      <Image src="/auth/wave-background.webp" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="-z-10 object-cover opacity-40" />
      <div className="relative w-full max-w-md">
        <div aria-hidden className="pointer-events-none absolute right-6 bottom-full z-0 -mb-3 h-24 w-28 sm:right-10 ">
          <Image src={MASCOT_SRC[mascot]} alt="" fill sizes="112px" className="object-contain object-bottom" />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </main>
  );
}
