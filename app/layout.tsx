import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { UserScoreProvider } from "@/context/UserScoreContext";
import { ExamTimeProvider } from "@/context/ExamTimeContext";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import ReactQueryProvider from "@/components/react-query-provider";
import Header from "@/components/header";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerador de Simulado ENEM",
  description: "Gerador de Simulado ENEM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ReactQueryProvider>
        <UserScoreProvider>
          <ExamTimeProvider>
            <html lang="en">
              <body className={`${inter.className} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                  <Header />
                  {children}
                  <Toaster/>
                </ThemeProvider>
              </body>
            </html>
          </ExamTimeProvider>
        </UserScoreProvider>
      </ReactQueryProvider>
    </ClerkProvider>
  );
}
