import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="relative overflow-hidden">
        <div className="neon-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
          <h1 className="text-balance font-display text-6xl font-black leading-[0.98] text-white sm:text-7xl">
            למדו את הרוטינה, פריים אחרי פריים.
          </h1>
          <p className="mt-5 max-w-xl text-frame-silver">
            מדריכי ריקוד יוקרתיים לרקדנים שרוצים לשלוט ברוטינה אחת לעומק —
            במראה, בהאטה, ומפורקת לספירות.
          </p>
          <Link
            href="/routine/neon-nights"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neon-cta px-6 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
          >
            צפו ברוטינת דוגמה
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </main>
    </>
  );
}
