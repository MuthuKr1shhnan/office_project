"use client";
import { useState, useEffect } from "react";
import Btn from "./Btn";
import logo from "../assets/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { menu, login, account } from "../config/navData";

// Mock components and data for demonstration

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState();
  const [otpVerified, setOtpVerified] = useState(false);
  const [roleVerified, setRoleVerified] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Current User", currentUser);
      if (!currentUser) {
        setUser(null);
      } else {
        setUser(currentUser);
        // Get user role from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setOtpVerified(true);
            setUserData(userDoc.data().name);
          }
          if (userDoc.exists() && userDoc.data().role === "patient") {
            setRoleVerified(true);
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  const isActiveLink = (link) => pathname === link;

  return (
    <div>
      {/* Desktop Sidebar */}
      <nav className='hidden h-screen md:block w-[250px]  p-4 border-r border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg'>
        <div className='flex flex-col h-full'>
          {/* Brand */}
          <Link href={"/"} className='mb-8'>
            <Image src={logo} height={36} alt='logo' />
          </Link>
          {/* Desktop Menu */}{" "}
          <div className='w-full border-2 rounded-2xl p-4'>
            {/* Top Row: Avatar + Email + ID + Info + Arrow */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {/* Placeholder Avatar */}
                <div className='w-12 h-12 bg-gray-300 rounded-full'></div>

                {/* Email + ID */}
                <div>
                  <div className='text-gray-800 font-semibold'>{userData}</div>
                  <div className='flex items-center gap-2'>
                    <span className='text-red-500 text-sm'>1767699033</span>
                    {/* Info Icon */}
                    <div className='w-4 h-4 bg-gray-300 rounded-full text-center text-xs flex items-center justify-center'>
                      i
                    </div>
                  </div>
                </div>
              </div>

              {/* Down Arrow */}
              <div
                className='text-gray-400 cursor-pointer'
                onClick={() => setShowButton(!showButton)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className={`h-5 w-5 transform ${
                    showButton ? "rotate-180" : ""
                  }`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>

            {/* Conditional Button */}
            {showButton && (
              <div className='mt-4'>
                {otpVerified && user ? (
                  <Btn variant='primary' className='w-full'>
                    <a href='/profile' className='block w-full text-center'>
                      {account.label}
                    </a>
                  </Btn>
                ) : (
                  <Btn variant='primary' className='w-full'>
                    <a href={login.path} className='block w-full text-center'>
                      {login.label}
                    </a>
                  </Btn>
                )}
              </div>
            )}
          </div>
          <div className='flex flex-col items-start my-auto space-y-8'>
            {menu.map((d, i) => (
              <Link
                key={i}
                href={d.link}
                className={`font-medium transition-all duration-200 px-4 py-2 rounded-lg w-full ${
                  isActiveLink(d.link)
                    ? "bg-indigo-50 text-indigo-600 border-l-4 border-l-indigo-600"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <nav className='md:hidden fixed top-0 z-50 w-full p-4 border-b border-slate-200 bg-white shadow-lg'>
        <div className='flex justify-between items-center'>
          {/* Brand */}
          <Link href={"/"}>
            <Image src={logo} height={36} alt='logo' />
          </Link>

          {/* Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 border-indigo-600 bg-slate-50 hover:bg-indigo-50 transition-all'
          >
            <svg className='w-5 h-5 stroke-indigo-600' viewBox='0 0 24 24'>
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
        </div>

        {/* Mobile Panel */}
        {isOpen && (
          <div
            className='fixed top-16 left-0 w-full h-full backdrop-blur-md bg-white/95 shadow-2xl z-50 overflow-y-auto'
            onClick={() => setIsOpen(false)}
          >
            <div className='flex flex-col flex-1 space-y-4 p-8 bg-gradient-to-br from-slate-50 to-slate-100 '>
              {menu.map((m, i) => (
                <a
                  key={i}
                  href={m.link}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActiveLink(m.link)
                      ? "bg-indigo-50 text-indigo-600 border-l-4 border-l-indigo-600"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {m.label}
                </a>
              ))}

              <div className='flex flex-col space-y-4 mt-auto'>
                <Btn variant='sec' className='w-full mt-4'>
                  <a
                    href='https://office-project-doctor.vercel.app/'
                    className='block w-full'
                  >
                    For Doctors
                  </a>
                </Btn>
                <div className='w-full border-2 rounded-2xl p-4'>
                  {/* Top Row: Avatar + Email + ID + Info + Arrow */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      {/* Placeholder Avatar */}
                      <div className='w-12 h-12 bg-gray-300 rounded-full'></div>

                      {/* Email + ID */}
                      <div>
                        <div className='text-gray-800 font-semibold'>Muthu</div>
                        <div className='flex items-center gap-2'>
                          <span className='text-red-500 text-sm'>
                            1767699033
                          </span>
                          {/* Info Icon */}
                          <div className='w-4 h-4 bg-gray-300 rounded-full text-center text-xs flex items-center justify-center'>
                            i
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Down Arrow */}
                    <div
                      className='text-gray-400 cursor-pointer'
                      onClick={() => setShowButton(!showButton)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className={`h-5 w-5 transform ${
                          showButton ? "rotate-180" : ""
                        }`}
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Conditional Button */}
                  {showButton && (
                    <div className='mt-4'>
                      {otpVerified && user ? (
                        <Btn variant='primary' className='w-full'>
                          <a
                            href='/profile'
                            className='block w-full text-center'
                          >
                            {account.label}
                          </a>
                        </Btn>
                      ) : (
                        <Btn variant='primary' className='w-full'>
                          <a
                            href={login.path}
                            className='block w-full text-center'
                          >
                            {login.label}
                          </a>
                        </Btn>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
const NAVBAR_ROUTES = ["/home", "/profile", "/settings"];
export function NavbarWrapper() {
  const pathname = usePathname();

  const shouldShowNavbar = NAVBAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!shouldShowNavbar) return null;

  return <Nav />;
}
