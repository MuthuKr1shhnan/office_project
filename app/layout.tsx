"use client";

import { usePathname } from "next/navigation";
import Nav from "../component/Nav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNav = pathname === "/";

  return (
    <html lang="en">
      <body>
        {!hideNav && <Nav />}
        {children}
      </body>
    </html>
  );
}
