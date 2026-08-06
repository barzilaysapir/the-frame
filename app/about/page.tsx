import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "אודות | The Frame by Barzilay",
  description:
    "The Frame by Barzilay היא פלטפורמת מדריכי ריקוד יוקרתית שמלמדת רוטינה אחת לעומק — פריים אחרי פריים.",
};

const VALUES = [
  {
    title: "עומק, לא כמות",
    description:
      "במקום עשרות סרטונים שטחיים, אנחנו מלמדים רוטינה אחת בכל פעם — עד שהיא נכנסת לגוף.",
  },
  {
    title: "פירוק אמיתי",
    description:
      "כל רוטינה מפורקת לספירות, עם מצב תרגול במראה ובהאטה, כך שאף תנועה לא נשארת סתומה.",
  },
  {
    title: "מדריכים מהשטח",
    description:
      "המדריכים שלנו רקדו בהפקות, קליפים ותחרויות אמיתיות — ומביאים את הניסיון הזה ישירות לשיעור.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="relative overflow-hidden">
        <div className="neon-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-balance font-display text-5xl font-black leading-[0.98] text-white sm:text-6xl">
            למדנו לרקוד בשטח. עכשיו אנחנו מלמדים אתכם.
          </h1>
          <p className="mt-5 text-frame-silver">
            The Frame by Barzilay נולדה מתוך תסכול אחד: מדריכי ריקוד ברשת שמלמדים
            שטחי, מהר מדי, בלי לתת לרקדן זמן להבין את התנועה. בנינו פלטפורמה
            שהופכת את זה — רוטינה אחת, בעומק מלא.
          </p>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-frame-border bg-frame-panel p-6 text-right"
              >
                <h2 className="font-display text-xl font-black text-white">
                  {value.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-frame-silver">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/routines"
              className="group inline-flex items-center gap-2 rounded-full bg-neon-cta px-6 py-3 text-sm font-semibold text-frame-bg transition-[filter] hover:brightness-110"
            >
              עיינו ברוטינות
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
