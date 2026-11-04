import Image from "next/image";
import type { AuthBackdropProps, AuthMascot } from "@/types/auth";
 
// One mascot pose per page (Figma 02 Masuk and 03 Buat akun). Both files already exist in public/auth/.
const MASCOT_SRC: Record<AuthMascot, string> = {
  login: "/auth/maskot-2.webp",
  signup: "/auth/maskot-1.webp",
};
 
// The wave artwork fills the section behind the card and the mascot peeks out from behind the card's top edge.
// Both images are decorative (alt=""), so the page still reads correctly if they fail to load.
export function AuthBackdrop({ mascot, children }: AuthBackdropProps) {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 pt-28 pb-16">
      {/* Above the fold, so it loads eagerly. */}
      <Image src="/shared/bg-wave-halftone.webp" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="-z-10 object-cover" />
      <div className="relative w-full max-w-md">
        {/* Behind the card: the card sits on z-10, so its top edge hides the mascot's feet. Raise -mb-6 to hide more. */}
        <div aria-hidden className="pointer-events-none absolute right-6 bottom-full z-0 -mb-6 size-24 sm:right-10">
          <Image src={MASCOT_SRC[mascot]} alt="" fill sizes="96px" className="object-contain object-bottom" />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </main>
  );
}