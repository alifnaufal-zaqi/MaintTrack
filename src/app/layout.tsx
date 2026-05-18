import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { Toaster } from "sonner";

const inter = Inter();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <ThemeProvider
            attribute={"class"}
            enableSystem
            defaultTheme="system"
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
