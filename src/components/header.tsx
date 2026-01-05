import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl">
              🏀
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Kotipelien toimitsijat
              </h1>
              <p className="text-sm text-muted">
                Hallitse kotipelien pöytäkirja- ja kellovuorot
              </p>
            </div>
          </div>
          <Link
            href="/hallinta"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary-dark transition-colors"
          >
            <span>⚙️</span>
            <span>Hallinta</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
