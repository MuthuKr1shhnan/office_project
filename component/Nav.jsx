"use client"; // if using Next.js App Router
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import Link from "next/link";
import Btn from "../component/Btn";
import Image from "next/image";
import ProfileDrawer from "../component/ProfileDrawer"; // ✅ import ProfileDrawer
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

const menu = [
  {
    label: "Home",
    link: "/home",
  },
  {
    label: "Doctors",
    link: "/doctors",
    hideFor: ["doctor"], // Hide for doctors
  },
  {
    label: "Patients",
    link: "/patients",
    hideFor: ["patient"], // Hide for patients
  },
  {
    label: "Feedback",
    link: "/feedback",
  },
  {
    label: "Support",
    link: "/support",
  },
];

const login = {
  label: "My Account",
  link: "/profile",
};

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  // 🔐 Check auth state and get user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserRole(null);
      } else {
        setUser(currentUser);
        
        // Get user role from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Filter menu items based on user role
  const filteredMenu = menu.filter((item) => {
    if (!item.hideFor) return true;
    return !item.hideFor.includes(userRole);
  });

  return (
    <header className="sticky w-full top-0 z-50 bg-white shadow border-b border-slate-200">
      <nav className="max-w-full lg:px-12 px-4 sm:px-6  flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/home" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Logo"
            className="w-16 lg:min-w-[230px] md:min-w-[170px] min-w-[150px] h-auto md:pr-8 pointer-events-none"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {filteredMenu.map((d, i) => (
            <Link
              href={d.link}
              key={i}
              className="text-slate-600 hover:text-slate-900"
            >
              {d.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Btn variant="primary" className="w-full" onClick={() => setIsOpen(true)}>
            {login.label}
          </Btn>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-slate-50"
        >
          <span className="sr-only">Open menu</span>
          <div className="space-y-1">
            <span className="block w-5 h-0.5 bg-slate-900"></span>
            <span className="block w-5 h-0.5 bg-slate-900"></span>
            <span className="block w-5 h-0.5 bg-slate-900"></span>
          </div>
        </button>
      </nav>

      {/* Mobile Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {filteredMenu.map((m, i) => (
              <Link
                key={i}
                href={m.link}
                className="block px-2 py-2 rounded hover:bg-slate-50"
              >
                {m.label}
              </Link>
            ))}

            <div className="flex gap-2 pt-2">
              <Btn
                className="flex-1 px-3 py-2 rounded-lg border bg-[#FE5B63] text-center"
                onClick={() => setIsOpen(true)}
              >
                {login.label}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Profile Drawer plugged in */}
      <ProfileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}