import Link from "next/link";
import { Button } from "@kit";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 font-serif text-5xl text-ink">404</h1>
        <p className="mb-8 text-sm text-ink-muted">Page introuvable</p>
        <Link href="/">
          <Button tone="lavender" fullWidth>
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </main>
  );
}
