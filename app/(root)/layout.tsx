import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <SessionProvider> {/* Wrap everything inside SessionProvider */}
            <main className="font-work-sans">
                <Navbar />
                {children}
            </main>
        </SessionProvider>
    );
}

