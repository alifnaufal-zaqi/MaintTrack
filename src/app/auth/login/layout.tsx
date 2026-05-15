import { DarkModeToggle } from "@/components/commons/dark-mode-toggle";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="flex items-center justify-between py-4 px-8">
        <h1 className="font-bold text-primary text-2xl">MaintTrack</h1>
        <DarkModeToggle />
      </header>
      <main className="w-full h-screen flex flex-col justify-center items-center p-4 lg:p-0">
        {children}
      </main>
    </>
  );
}
