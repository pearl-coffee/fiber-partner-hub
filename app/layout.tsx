import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fiber Partner Hub — управление строительством ВОЛС",
  description: "Единая платформа управления строительством и подключением объектов ВОЛС.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
