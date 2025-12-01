import { Spinner } from "./ui/spinner";

export default function Loader() {
  return (
    <main className="bg-card m-2.5 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl px-9 pt-6 font-medium">
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    </main>
  );
}
