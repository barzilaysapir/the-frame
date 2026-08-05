import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          למדו את הרוטינה, פריים אחרי פריים.
        </h1>
        <p className="mt-4 max-w-xl text-frame-silver">
          מדריכי ריקוד יוקרתיים לרקדנים שרוצים לשלוט ברוטינה אחת לעומק —
          במראה, בהאטה, ומפורקת לספירות.
        </p>
        <Link
          href="/routine/hip-hop-groove-101"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-frame-bg transition-colors hover:bg-frame-gold"
        >
          צפו ברוטינת דוגמה
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </main>
    </>
  );
}
