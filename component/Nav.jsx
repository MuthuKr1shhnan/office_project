"use client"; // if using Next.js App Router
import logo from "../assets/logo.png";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ Import usePathname
import Btn from "../component/Btn";
import Image from "next/image";
import ProfileDrawer from "../component/ProfileDrawer";
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
    hideFor: "doctor",
  },
  {
    label: "Patients",
    link: "/patients",
    hideFor: "patient",
  },
  {
    label: "Feedback",
    link: "/feedback",
  },
  {
    label: "About",
    link: "/about",
  },
];

const account = {
  label: "My Account",
  link: "/profile",
};

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current pathname

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
      router.push("/");
      localStorage.removeItem("isLoggedIn");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Filter menu items based on user role
  const filteredMenu = menu.filter((item) => {
    if (!item.hideFor) return true;
    return !item.hideFor.includes(userRole);
  });

  // ✅ Helper function to check if link is active
  const isActiveLink = (link) => pathname === link;

  return (
    <nav className='bg-white  border-b border-slate-200 sticky top-0 z-50'>
      <div className=' flex flex-wrap items-center justify-between p-3 pr-8 pl-8'>
        {/* Brand */}
        <Link href='/'>
          <Image src={logo} alt='Logo' className='h-8 w-auto' />
        </Link>

        {/* Desktop Menu */}
        <div className='hidden md:flex items-center space-x-8'>
          {filteredMenu.map((d, i) => (
            <Link
              key={i}
              href={d.link}
              className={`font-medium transition-colors ${
                isActiveLink(d.link)
                  ? "text-[#FE676E]" // ✅ Active state for mobile
                  : "text-slate-600 hover:text-[#f97c83]"
              }`}
            >
              {d.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className='hidden md:flex items-center space-x-4'>
          <Btn
            onClick={() => {
              setIsOpen(false);
              setIsOpenDrawer(true);
            }}
            variant='primary'
          >
            {account.label}
          </Btn>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#FE636B] bg-slate-50'
        >
          <span className='sr-only'>Open menu</span>
          <svg className='w-5 h-5 stroke-[#FE636B]' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              className={`transition-all duration-300 origin-center ${
                isOpen ? "rotate-45 translate-y-0" : ""
              }`}
              d={isOpen ? "M4 12h16" : "M4 6h16"}
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              className={`transition-opacity duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
              d='M4 12h16'
            />
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              className={`transition-all duration-300 origin-center ${
                isOpen ? "-rotate-45 translate-y-0" : ""
              }`}
              d={isOpen ? "M4 12h16" : "M4 18h16"}
            />
          </svg>
        </button>

        {/* Mobile Panel */}
        {isOpen && (
          <div
            className={`fixed top-16 pointer-none left-0 backdrop-blur-md h-full w-full bg-white/1 pl-8 pr-8 shadow-2xl 
            transform transition-transform duration-800 ease-in-out 
            z-60 overflow-y-auto ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <div className='w-full md:hidden   pt-10'>
              <div className='flex flex-col space-y-8'>
                {filteredMenu.map((m, i) => (
                  <Link
                    key={i}
                    href={m.link}
                    onClick={() => setIsOpen(false)}
                    className={`font-medium transition-colors ${
                      isActiveLink(m.link)
                        ? "text-[#FE676E]" // ✅ Active state for mobile
                        : "text-slate-600 hover:text-[#f97c83]"
                    }`}
                  >
                    {m.label}
                  </Link>
                ))}
                <Btn
                  onClick={() => {
                    setIsOpen(false);
                    setIsOpenDrawer(true);
                  }}
                  variant='primary'
                >
                  {account.label}
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Profile Drawer plugged in */}
        <ProfileDrawer
          isOpen={isOpenDrawer}
          onClose={() => setIsOpenDrawer(false)}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </nav>
  );
}
