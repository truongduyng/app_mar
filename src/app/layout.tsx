import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
