import Link from "next/link";

export const metadata = {
  title: "Preview Orders | LUNÉA SKIN",
  robots: { index: false, follow: false },
};

export default function PreviewOrdersPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6" dir="ltr">
      <Link href="/" className="text-sm text-sage-700 underline">
        ← Back to site
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-sage-900">Preview Orders</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Production orders are stored in the configured Google Sheet. This preview-only database page is not used in production.
      </p>
    </main>
  );
}
