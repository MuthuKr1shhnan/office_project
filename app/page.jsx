// "use client";
// import { useState } from "react";
// import { auth, googleAuthProvider } from "../lib/firebase";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signInWithPopup,
//   signOut,
// } from "firebase/auth";
// import "./globals.css";
// import Btn from "@/component/Btn";

// const Page = () => {
//   const [mode, setMode] = useState("login");

//   // Login state
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");

//   // Register state
//   const [regName, setRegName] = useState("");
//   const [regEmail, setRegEmail] = useState("");
//   const [regPassword, setRegPassword] = useState("");
//   const [regConfirm, setRegConfirm] = useState("");

//   const [regNameError, setRegNameError] = useState("");
//   const [regEmailError, setRegEmailError] = useState("");
//   const [regPasswordError, setRegPasswordError] = useState("");
//   const [regConfirmError, setRegConfirmError] = useState("");

//   // Role
//   const [role, setRole] = useState("");
//   const [degree, setDegree] = useState("");
//   const [roleError, setRoleError] = useState("");
//   const [degreeError, setDegreeError] = useState("");

//   // Address
//   const [address, setAddress] = useState("");
//   const [addressError, setAddressError] = useState("");

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   // ----------------------------------------------------------------
//   // GOOGLE LOGIN
//   // ----------------------------------------------------------------
//   const handleGoogleLogin = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleAuthProvider);
//       console.log("Google Login User:", result.user);
//       alert("Google login successful");
//     } catch (err) {
//       console.error(err);
//       alert("Google login failed");
//     }
//   };

//   // GOOGLE REGISTER
//   const handleGoogleRegister = async () => {
//     try {
//       const result = await signInWithPopup(auth, googleAuthProvider);
//       console.log("Google Register User:", result.user);
//       alert("Google registration successful");
//     } catch (err) {
//       console.error(err);
//       alert("Google registration failed");
//     }
//   };

//   // ----------------------------------------------------------------
//   // LOGIN SUBMIT
//   // ----------------------------------------------------------------
//   const validateLogin = () => {
//     let valid = true;
//     setEmailError("");
//     setPasswordError("");

//     if (!email.trim()) {
//       setEmailError("Email is required.");
//       valid = false;
//     } else if (!emailRegex.test(email)) {
//       setEmailError("Enter a valid email.");
//       valid = false;
//     }

//     if (!password.trim()) {
//       setPasswordError("Password is required.");
//       valid = false;
//     }

//     return valid;
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateLogin()) return;

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       alert("Login successful");
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   // ----------------------------------------------------------------
//   // REGISTER SUBMIT
//   // ----------------------------------------------------------------
//   const validateRegister = () => {
//     let valid = true;

//     setRegNameError("");
//     setRegEmailError("");
//     setRegPasswordError("");
//     setRegConfirmError("");
//     setRoleError("");
//     setDegreeError("");
//     setAddressError("");

//     if (!regName.trim()) {
//       setRegNameError("Name is required.");
//       valid = false;
//     }

//     if (!regEmail.trim()) {
//       setRegEmailError("Email is required.");
//       valid = false;
//     } else if (!emailRegex.test(regEmail)) {
//       setRegEmailError("Enter a valid email.");
//       valid = false;
//     }

//     if (!regPassword.trim()) {
//       setRegPasswordError("Password is required.");
//       valid = false;
//     } else if (regPassword.length < 6) {
//       setRegPasswordError("Password must be 6+ characters.");
//       valid = false;
//     }

//     if (regConfirm !== regPassword) {
//       setRegConfirmError("Passwords do not match.");
//       valid = false;
//     }

//     if (!role) {
//       setRoleError("Select account type.");
//       valid = false;
//     }

//     if (role === "doctor" && !degree.trim()) {
//       setDegreeError("Degree is required for doctors.");
//       valid = false;
//     }

//     if (!address.trim()) {
//       setAddressError("Address required.");
//       valid = false;
//     }

//     return valid;
//   };

//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateRegister()) return;

//     try {
//       const result = await createUserWithEmailAndPassword(
//         auth,
//         regEmail,
//         regPassword
//       );

//       console.log("Registered:", result.user);

//       alert("Registration successful");
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   // ----------------------------------------------------------------
//   // LOGOUT
//   // ----------------------------------------------------------------
//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       alert("Logged out");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ----------------------------------------------------------------
//   // UI (UNCHANGED)
//   // ----------------------------------------------------------------
//   return (
//     <div
//       className='flex items-center overflow-auto mt-auto justify-center bg-gray-50'
//       style={{ height: `calc(100vh - 65px)` }}
//     >
//       <div className='w-full max-w-md my-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
//         {/* HEADER */}
//         <div className='mb-4 text-center'>
//           <h1 className='text-lg font-medium text-gray-800'>
//             {mode === "login" ? "Welcome back" : "Create your account"}
//           </h1>
//           <p className='text-sm text-gray-500 mt-1'>
//             {mode === "login"
//               ? "Sign in to continue"
//               : "Create an account to get started"}
//           </p>
//         </div>

//         {/* LOGIN FORM */}
//         {mode === "login" ? (
//           <form onSubmit={handleLoginSubmit} className='space-y-4'>
//             {/* EMAIL */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>Email</label>
//               <input
//                 type='email'
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                   emailError ? "border-red-200" : "border-gray-200"
//                 }`}
//                 placeholder='you@example.com'
//               />
//               {emailError && (
//                 <p className='text-xs text-red-600 mt-1'>{emailError}</p>
//               )}
//             </div>

//             {/* PASSWORD */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>
//                 Password
//               </label>
//               <input
//                 type='password'
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                   passwordError ? "border-red-200" : "border-gray-200"
//                 }`}
//                 placeholder='••••••••'
//               />
//               {passwordError && (
//                 <p className='text-xs text-red-600 mt-1'>{passwordError}</p>
//               )}
//             </div>

//             <Btn variant='primary' className='w-full'>
//               Sign in
//             </Btn>

//             {/* OR */}
//             <div className='flex items-center mt-1'>
//               <div className='grow border-t border-gray-100'></div>
//               <span className='mx-3 text-xs text-gray-400'>or</span>
//               <div className='grow border-t border-gray-100'></div>
//             </div>

//             <Btn
//               variant='second'
//               className='w-full'
//               onClick={handleGoogleLogin}
//             >
//               Sign in with Google
//             </Btn>

//             {/* LOGOUT BUTTON FOR TESTING */}
//             <button
//               type='button'
//               onClick={handleLogout}
//               className='text-xs text-gray-400 underline mt-2'
//             >
//               Logout
//             </button>
//           </form>
//         ) : (
//           // REGISTER FORM
//           <form onSubmit={handleRegisterSubmit} className='space-y-4'>
//             {/* ROLE */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>
//                 Account type
//               </label>

//               <div className='flex items-center gap-4'>
//                 {/* Doctor */}
//                 <div
//                   onClick={() => setRole("doctor")}
//                   className='flex items-center gap-2 cursor-pointer select-none'
//                 >
//                   <span
//                     className={`h-4 w-4 rounded-full border flex items-center justify-center ${
//                       role === "doctor" ? "border-[#FE5B63]" : "border-gray-300"
//                     }`}
//                   >
//                     {role === "doctor" && (
//                       <span className='h-2 w-2 rounded-full bg-[#FE5B63]'></span>
//                     )}
//                   </span>
//                   <span className='text-sm text-gray-700'>Doctor</span>
//                 </div>

//                 {/* Patient */}
//                 <div
//                   onClick={() => setRole("patient")}
//                   className='flex items-center gap-2 cursor-pointer select-none'
//                 >
//                   <span
//                     className={`h-4 w-4 rounded-full border flex items-center justify-center ${
//                       role === "patient"
//                         ? "border-[#FE5B63]"
//                         : "border-gray-300"
//                     }`}
//                   >
//                     {role === "patient" && (
//                       <span className='h-2 w-2 rounded-full bg-[#FE5B63]'></span>
//                     )}
//                   </span>
//                   <span className='text-sm text-gray-700'>Patient</span>
//                 </div>
//               </div>

//               {roleError && (
//                 <p className='text-xs text-red-600 mt-1'>{roleError}</p>
//               )}
//             </div>

//             {/* DEGREE */}
//             {role === "doctor" && (
//               <div>
//                 <label className='block text-xs text-gray-600 mb-1'>
//                   Degree
//                 </label>
//                 <input
//                   type='text'
//                   value={degree}
//                   onChange={(e) => setDegree(e.target.value)}
//                   className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                     degreeError ? "border-red-200" : "border-gray-200"
//                   }`}
//                   placeholder='MBBS / MD / etc'
//                 />
//                 {degreeError && (
//                   <p className='text-xs text-red-600 mt-1'>{degreeError}</p>
//                 )}
//               </div>
//             )}

//             {/* ADDRESS */}
//             {role && (
//               <div>
//                 <label className='block text-xs text-gray-600 mb-1'>
//                   {role === "doctor" ? "Office address" : "Home address"}
//                 </label>
//                 <input
//                   type='text'
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                     addressError ? "border-red-200" : "border-gray-200"
//                   }`}
//                   placeholder={
//                     role === "doctor"
//                       ? "Enter clinic / hospital address"
//                       : "Enter home address"
//                   }
//                 />
//                 {addressError && (
//                   <p className='text-xs text-red-600 mt-1'>{addressError}</p>
//                 )}
//               </div>
//             )}

//             {/* Name */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>
//                 Full name
//               </label>
//               <input
//                 type='text'
//                 value={regName}
//                 onChange={(e) => setRegName(e.target.value)}
//                 className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                   regNameError ? "border-red-200" : "border-gray-200"
//                 }`}
//                 placeholder='Your full name'
//               />
//               {regNameError && (
//                 <p className='text-xs text-red-600 mt-1'>{regNameError}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>Email</label>
//               <input
//                 type='email'
//                 value={regEmail}
//                 onChange={(e) => setRegEmail(e.target.value)}
//                 className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                   regEmailError ? "border-red-200" : "border-gray-200"
//                 }`}
//                 placeholder='you@example.com'
//               />
//               {regEmailError && (
//                 <p className='text-xs text-red-600 mt-1'>{regEmailError}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>
//                 Password
//               </label>
//               <input
//                 type='password'
//                 value={regPassword}
//                 onChange={(e) => setRegPassword(e.target.value)}
//                 className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                   regPasswordError ? "border-red-200" : "border-gray-200"
//                 }`}
//                 placeholder='Choose a password'
//               />
//               {regPasswordError && (
//                 <p className='text-xs text-red-600 mt-1'>{regPasswordError}</p>
//               )}
//             </div>

//             {/* Confirm */}
//             <div>
//               <label className='block text-xs text-gray-600 mb-1'>
//                 Confirm password
//               </label>
//               <input
//                 type='password'
//                 value={regConfirm}
//                 onChange={(e) => setRegConfirm(e.target.value)}
//                 className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
//                   regConfirmError ? "border-red-200" : "border-gray-200"
//                 }`}
//                 placeholder='Repeat your password'
//               />
//               {regConfirmError && (
//                 <p className='text-xs text-red-600 mt-1'>{regConfirmError}</p>
//               )}
//             </div>

//             <Btn variant='primary' className='w-full'>
//               Create account
//             </Btn>

//             <div className='flex items-center mt-1'>
//               <div className='grow border-t border-gray-100'></div>
//               <span className='mx-3 text-xs text-gray-400'>or</span>
//               <div className='grow border-t border-gray-100'></div>
//             </div>

//             <Btn
//               variant='second'
//               className='w-full'
//               onClick={handleGoogleRegister}
//             >
//               Register with Google
//             </Btn>
//           </form>
//         )}

//         {/* Footer */}
//         <div className='mt-4'>
//           <div className='flex items-center justify-between text-xs text-gray-500'>
//             <span>
//               {mode === "login"
//                 ? "Don't have an account?"
//                 : "Already have an account?"}
//             </span>

//             <button
//               onClick={() => setMode(mode === "login" ? "register" : "login")}
//               className='text-sm font-medium text-[#FE5B63] hover:underline'
//             >
//               {mode === "login" ? "Register here!" : "Sign in"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleAuthProvider } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
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

  const [regNameError, setRegNameError] = useState("");
  const [regEmailError, setRegEmailError] = useState("");
  const [regPasswordError, setRegPasswordError] = useState("");
  const [regConfirmError, setRegConfirmError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ----------------------------------------------------------------
  // GOOGLE LOGIN / REGISTER
  // ----------------------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);

      console.log("Google User:", result.user.displayName);
      alert("Google login successful");

      router.push("/home");
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);

      console.log("Google User:", result.user.displayName);
      alert("Google registration successful");

      router.push("/home");
    } catch (err) {
      console.error(err);
      alert("Google registration failed");
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
      alert("Login successful");

      router.push("/home");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ----------------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------------
  const validateRegister = () => {
    let valid = true;

    setRegNameError("");
    setRegEmailError("");
    setRegPasswordError("");
    setRegConfirmError("");

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

    return valid;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        regEmail,
        regPassword
      );

      // ✅ SET USER NAME
      await updateProfile(result.user, {
        displayName: regName,
      });

      console.log("Registered user:", result.user.displayName);
      alert("Registration successful");

      router.push("/home");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ----------------------------------------------------------------
  // LOGOUT (TESTING)
  // ----------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out");
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------
  return (
    <div
      className="flex items-center overflow-auto mt-auto justify-center bg-gray-50"
      style={{ height: `calc(100vh - 65px)` }}
    >
      <div className="w-full max-w-md my-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* HEADER */}
        <div className="mb-4 text-center">
          <h1 className="text-lg font-medium text-gray-800">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login"
              ? "Sign in to continue"
              : "Create an account to get started"}
          </p>
        </div>

        {/* LOGIN FORM */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* EMAIL */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
                  emailError ? "border-red-200" : "border-gray-200"
                }`}
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="text-xs text-red-600 mt-1">{emailError}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
                  passwordError ? "border-red-200" : "border-gray-200"
                }`}
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="text-xs text-red-600 mt-1">{passwordError}</p>
              )}
            </div>

            <Btn variant="primary" className="w-full">
              Sign in
            </Btn>

            {/* OR */}
            <div className="flex items-center mt-1">
              <div className="grow border-t border-gray-100"></div>
              <span className="mx-3 text-xs text-gray-400">or</span>
              <div className="grow border-t border-gray-100"></div>
            </div>

            <Btn
              variant="second"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              Sign in with Google
            </Btn>

            {/* LOGOUT BUTTON FOR TESTING */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-400 underline mt-2"
            >
              Logout
            </button>
          </form>
        ) : (
          // REGISTER FORM
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
                  regNameError ? "border-red-200" : "border-gray-200"
                }`}
                placeholder="Your full name"
              />
              {regNameError && (
                <p className="text-xs text-red-600 mt-1">{regNameError}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
                  regEmailError ? "border-red-200" : "border-gray-200"
                }`}
                placeholder="you@example.com"
              />
              {regEmailError && (
                <p className="text-xs text-red-600 mt-1">{regEmailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
                  regPasswordError ? "border-red-200" : "border-gray-200"
                }`}
                placeholder="Choose a password"
              />
              {regPasswordError && (
                <p className="text-xs text-red-600 mt-1">{regPasswordError}</p>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 ${
                  regConfirmError ? "border-red-200" : "border-gray-200"
                }`}
                placeholder="Repeat your password"
              />
              {regConfirmError && (
                <p className="text-xs text-red-600 mt-1">{regConfirmError}</p>
              )}
            </div>

            <Btn variant="primary" className="w-full">
              Create account
            </Btn>

            <div className="flex items-center mt-1">
              <div className="grow border-t border-gray-100"></div>
              <span className="mx-3 text-xs text-gray-400">or</span>
              <div className="grow border-t border-gray-100"></div>
            </div>

            <Btn
              variant="second"
              className="w-full"
              onClick={handleGoogleRegister}
            >
              Register with Google
            </Btn>
          </form>
        )}

        {/* Footer */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm font-medium text-[#FE5B63] hover:underline"
            >
              {mode === "login" ? "Register here!" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
