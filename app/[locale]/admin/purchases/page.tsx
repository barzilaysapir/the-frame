"use client";

import { useParams } from "next/navigation";
import { AdminPurchasesList } from "@/components/admin/AdminPurchasesList";
import { isLocale } from "@/lib/i18n/config";
import { getDictionarySync } from "@/lib/i18n/get-dictionary";

export default function AdminPurchasesPage() {
  const params = useParams<{ locale: string }>();
  const locale = isLocale(params.locale) ? params.locale : "he";
  const dict = getDictionarySync(locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl">
          {dict.admin.purchases.title}
        </h1>
        <p className="mt-4 text-frame-silver">{dict.admin.purchases.subtitle}</p>
      </div>

      <AdminPurchasesList labels={dict.admin.purchases} />
    </main>
  );
}
