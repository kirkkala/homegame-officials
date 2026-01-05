import { GamesList } from "@/components/games-list";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <GamesList />
      </main>
    </div>
  );
}
