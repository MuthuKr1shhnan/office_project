"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Nav from "../component/Nav";
import "./globals.css";
import Btn from "@/component/Btn";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNav = pathname === "/";
  const router = useRouter();

  // Use state to trigger re-render after confirming we're on client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // mark that we're running on the client
  }, [isClient]);

  // Determine login status safely on client
  const isLoggedIn = isClient && localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn && pathname === "/") router.push("/home");
  // Check if route is protected
  const isProtected = pathname !== "/";

  return (
    <html lang='en'>
      <body
        className='w-full bg-gray-50'
        style={{ height: "calc(100vh - 65px)" }}
      >
        {!hideNav && <Nav />}

        {isProtected && !isLoggedIn ? (
          <div className='flex flex-col h-full items-center justify-center px-6 text-center'>
            <div className='max-w-md w-full bg-white rounded-xl shadow-md p-8'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
                You should login
              </h2>
              <p className='text-gray-600 mb-6'>
                Please login to access this page.
              </p>
              <button
                onClick={() => router.push("/")}
                className='w-full rounded-lg bg-[#FE5B63] text-white py-3 hover:bg-[#ff6b71] shadow-sm transition-colors'
              >
                Log In
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
