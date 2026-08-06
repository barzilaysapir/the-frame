/** Pass-through root layout — html/body live in `app/[locale]/layout.tsx`. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
