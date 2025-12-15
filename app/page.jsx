"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleAuthProvider, db } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./globals.css";
import Btn from "@/component/Btn";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regFee, setRegFee] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regDegree, setRegDegree] = useState("");

  // Register errors
  const [regNameError, setRegNameError] = useState("");
  const [regEmailError, setRegEmailError] = useState("");
  const [regPasswordError, setRegPasswordError] = useState("");
  const [regConfirmError, setRegConfirmError] = useState("");
  const [regRoleError, setRegRoleError] = useState("");
  const [regFeeError, setRegFeeError] = useState("");
  const [regPhoneError, setRegPhoneError] = useState("");
  const [regAddressError, setRegAddressError] = useState("");
  const [regDegreeError, setRegDegreeError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ----------------------------------------------------------------
  // LOAD USER DETAILS FROM FIRESTORE
  // ----------------------------------------------------------------
  const loadUserDetails = async (user) => {
    if (!user?.uid) return null;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      console.log("User Data:", userDoc.data());

      if (userDoc.exists()) {
        const userData = userDoc.data();
      
        return userData;
      } else {
        console.log("No user document found");
        return null;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  };

  // ----------------------------------------------------------------
  // CHECK IF USER HAS ROLE
  // ----------------------------------------------------------------
  const checkUserRole = async (user) => {
    try {
      const userData = await loadUserDetails(user);

      if (userData && userData.role) {
        // User already has a role, store it in localStorage and go to home
        localStorage.setItem("userRole", userData.role);

        // Store additional user details if needed

        console.log("User details loaded:", userData);
        router.push("/home");
      } else {
        // Google user without role - redirect to complete profile
        alert("Please complete your profile by registering with your details");
        await signOut(auth);
      }
    } catch (err) {
      console.error("Error checking user role:", err);
      alert("Error loading user data. Please try again.");
    }
  };

  // ----------------------------------------------------------------
  // GOOGLE LOGIN
  // ----------------------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      console.log("Google User:", result.user.displayName);
      await checkUserRole(result.user);
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  // ----------------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------------
  const validateLogin = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Enter a valid email.");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    }

    return valid;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in user:", result.user.displayName);
      await checkUserRole(result.user);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ----------------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------------
  const clearRegisterErrors = () => {
    setRegNameError("");
    setRegEmailError("");
    setRegPasswordError("");
    setRegConfirmError("");
    setRegRoleError("");
    setRegFeeError("");
    setRegPhoneError("");
    setRegAddressError("");
    setRegDegreeError("");
  };

  const validateRegister = () => {
    clearRegisterErrors();
    let valid = true;

    if (!regName.trim()) {
      setRegNameError("Name is required.");
      valid = false;
    }

    if (!regEmail.trim()) {
      setRegEmailError("Email is required.");
      valid = false;
    } else if (!emailRegex.test(regEmail)) {
      setRegEmailError("Enter a valid email.");
      valid = false;
    }

    if (!regPassword.trim()) {
      setRegPasswordError("Password is required.");
      valid = false;
    } else if (regPassword.length < 6) {
      setRegPasswordError("Password must be 6+ characters.");
      valid = false;
    }

    if (regConfirm !== regPassword) {
      setRegConfirmError("Passwords do not match.");
      valid = false;
    }

    if (!regRole) {
      setRegRoleError("Please select a role.");
      valid = false;
    }

    if (!regPhone.trim()) {
      setRegPhoneError("Phone number is required.");
      valid = false;
    } else if (!/^\d{10}$/.test(regPhone.replace(/[\s-]/g, ""))) {
      setRegPhoneError("Enter a valid 10-digit phone number.");
      valid = false;
    }

    if (!regAddress.trim()) {
      setRegAddressError("Address is required.");
      valid = false;
    }
    if (isNaN(regFee)) {
      setRegFeeError("Invalid Amount!, Enter valid number.");
      valid = false;
    }
    if (regRole === "doctor" && !regDegree.trim()) {
      setRegDegreeError("Degree is required for doctors.");
      valid = false;
    }

    return valid;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    try {
      // Create user account
      const result = await createUserWithEmailAndPassword(
        auth,
        regEmail,
        regPassword
      );

      // Update profile with name
      await updateProfile(result.user, {
        displayName: regName,
      });

      // Prepare user data
      const userData = {
        uid: result.user.uid,
        role: regRole,
        fee: regFee,
        email: regEmail,
        displayName: regName,
        phoneNumber: regPhone,
        address: regAddress,
        createdAt: new Date().toISOString(),
      };

      // Add degree only if doctor
      if (regRole === "doctor") {
        userData.degree = regDegree;
      }

      // Save to Firestore
      await setDoc(doc(db, "users", result.user.uid), userData);

      // Store in localStorage
      localStorage.setItem("userRole", regRole);

      if (regRole === "doctor") {
        localStorage.setItem("userDegree", regDegree);
      }

      console.log("User registered successfully:", userData);
      alert("Registration successful!");
      router.push("/home");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
 
  // ----------------------------------------------------------------
  // UI - LOGIN/REGISTER
  // ----------------------------------------------------------------
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
        {/* HEADER */}
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className='text-sm text-gray-600'>
            {mode === "login"
              ? "Sign in to continue"
              : "Fill in your details to get started"}
          </p>
        </div>

        {/* LOGIN FORM */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className='space-y-4'>
            {/* EMAIL */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>Email</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  emailError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='you@example.com'
              />
              {emailError && (
                <div className='text-xs text-red-600 mt-1'>{emailError}</div>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='••••••••'
              />
              {passwordError && (
                <div className='text-xs text-red-600 mt-1'>{passwordError}</div>
              )}
            </div>

            <Btn variant='primary' type='submit' className='w-full py-3'>
              Sign in
            </Btn>

            {/* OR */}
            <div className='relative flex items-center justify-center my-4'>
              <div className='border-t border-gray-200 w-full' />
              <span className='absolute bg-white px-4 text-xs text-gray-500'>
                or
              </span>
            </div>

            <Btn
              variant='second'
              type='button'
              onClick={handleGoogleLogin}
              className='w-full py-3'
            >
              Sign in with Google
            </Btn>
          </form>
        ) : (
          // REGISTER FORM
          <form onSubmit={handleRegisterSubmit} className='space-y-4'>
            {/* Name */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Full name *
              </label>
              <input
                type='text'
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  regNameError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='Your full name'
              />
              {regNameError && (
                <div className='text-xs text-red-600 mt-1'>{regNameError}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Email *
              </label>
              <input
                type='email'
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  regEmailError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='you@example.com'
              />
              {regEmailError && (
                <div className='text-xs text-red-600 mt-1'>{regEmailError}</div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className='block text-xs text-gray-600 mb-2'>
                I am a *
              </label>
              <div className='flex gap-3'>
                <label
                  className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    regRole === "patient"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    name='role'
                    value='patient'
                    checked={regRole === "patient"}
                    onChange={(e) => setRegRole(e.target.value)}
                    className='sr-only'
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    Patient
                  </span>
                </label>

                <label
                  className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    regRole === "doctor"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type='radio'
                    name='role'
                    value='doctor'
                    checked={regRole === "doctor"}
                    onChange={(e) => setRegRole(e.target.value)}
                    className='sr-only'
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    Doctor
                  </span>
                </label>
              </div>
              {regRoleError && (
                <div className='text-xs text-red-600 mt-1'>{regRoleError}</div>
              )}
            </div>
            {regRole === "doctor" && (
              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  Consultation Fee &#8377;
                </label>
                <input
                  type='text'
                  value={regFee}
                  onChange={(e) => setRegFee(e.target.value)}
                  className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    regFeeError ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder='you@example.com'
                />
                {regFeeError && (
                  <div className='text-xs text-red-600 mt-1'>{regFeeError}</div>
                )}
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Phone Number *
              </label>
              <input
                type='tel'
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  regPhoneError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='1234567890'
              />
              {regPhoneError && (
                <div className='text-xs text-red-600 mt-1'>{regPhoneError}</div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Address *
              </label>
              <textarea
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  regAddressError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='Your complete address'
                rows='2'
              />
              {regAddressError && (
                <div className='text-xs text-red-600 mt-1'>
                  {regAddressError}
                </div>
              )}
            </div>

            {/* Degree (only for doctors) */}
            {regRole === "doctor" && (
              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  Degree *
                </label>
                <input
                  type='text'
                  value={regDegree}
                  onChange={(e) => setRegDegree(e.target.value)}
                  className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    regDegreeError ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder='MBBS, MD, etc.'
                />
                {regDegreeError && (
                  <div className='text-xs text-red-600 mt-1'>
                    {regDegreeError}
                  </div>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Password *
              </label>
              <input
                type='password'
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  regPasswordError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='Choose a password'
              />
              {regPasswordError && (
                <div className='text-xs text-red-600 mt-1'>
                  {regPasswordError}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Confirm password *
              </label>
              <input
                type='password'
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  regConfirmError ? "border-red-300" : "border-gray-200"
                }`}
                placeholder='Repeat your password'
              />
              {regConfirmError && (
                <div className='text-xs text-red-600 mt-1'>
                  {regConfirmError}
                </div>
              )}
            </div>

            <Btn variant='primary' type='submit' className='w-full py-3 mt-6'>
              Create account
            </Btn>
          </form>
        )}

        {/* Footer */}
        <div className='text-center mt-6 text-sm text-gray-600'>
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className='ml-1 text-sm font-medium text-[#FE5B63] hover:underline'
          >
            {mode === "login" ? "Register here!" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
