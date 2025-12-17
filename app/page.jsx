"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleAuthProvider, db } from "../lib/firebase";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import { parsePhoneNumberWithError } from "libphonenumber-js";
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
import { EyeCloseIcon, EyeOpenIcon } from "@/assets/icon";

// Validation Schemas
const loginSchema = Yup.object({
  emailLogin: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  passwordLogin: Yup.string().required("Password is required"),
});

const registerSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[A-Za-z\s.]+$/, "Only letter are allowed")
    .matches(/^[A-Za-z]/, "Name must start with a letter")
    .matches(/[A-Za-z]$/, "Name must not end with a dot or any symbols"),
  email: Yup.string()
    .required("Email is required")
    .matches(/^\S+$/, "Email should not contain empty space!")
    .email("Enter a valid email")
    .matches(
      /(.com)$/,
      "Email domain is invalid. Please use @gmail.com or @yahoo.com."
    ),
  password: Yup.string()
    .required("Password is required")
    .matches(/^\S+$/, "Password must not contain spaces")
    .matches(/[A-Za-z]/, "Password must contain at least one letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Password must contain at least one symbol")
    .min(12, "Password must be at least 12 characters")
    .matches(/[^A-Za-z0-9]{1}/, "Password must contain only one symbol"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  role: Yup.string()
    .oneOf(["patient", "doctor"], "Please select a role")
    .required("Please select a role"),
  fee: Yup.string().when("role", ([role], schema) => {
    return role === "doctor"
      ? schema
          .test(
            "is-valid-number",
            "Invalid amount! Enter valid number",
            function (value) {
              if (!value) return false;
              const num = Number(value);
              return !isNaN(num);
            }
          )
          .test("is-positive", "Fee must be positive", function (value) {
            if (!value) return false;
            const num = Number(value);
            return num > 0;
          })
          .required("Consultation fee is required")
      : schema;
  }),
  phone: Yup.string()
    .test("is-valid-phone", "Enter a valid phone number", function (value) {
      if (!value) return false;
      try {
        const phoneNumber = parsePhoneNumberWithError(`+${value}`);
        return phoneNumber.isValid();
      } catch (error) {
        console.log(error.message);
        return false;
      }
    })
    .required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  degree: Yup.string().when("role", ([role], schema) => {
    return role === "doctor"
      ? schema.required("Degree is required for doctors")
      : schema;
  }),
});

// Login Component
const Login = ({ onLoginSuccess, onGoogleLogin }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Formik
      initialValues={{ emailLogin: "", passwordLogin: "" }}
      validationSchema={loginSchema}
      validateOnChange
      validateOnBlur
      onSubmit={onLoginSuccess}
    >
      {({ isSubmitting }) => (
        <Form className='space-y-4'>
          <div>
            <label className='block text-xs text-gray-600 mb-1'>Email</label>
            <div className='flex items-center w-full border rounded-lg bg-white px-3 py-2'>
              <Field
                type='email'
                name='emailLogin'
                className='flex-1 text-sm p-1 bg-transparent outline-none'
                placeholder='you@example.com'
                autoComplete='username'
              />
            </div>
            <ErrorMessage
              name='emailLogin'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          <div>
            <label className='block text-xs text-gray-600 mb-1'>Password</label>
            <div className='flex items-center w-full border rounded-lg bg-white px-3 py-1'>
              <Field
                type={showPassword ? "text" : "password"}
                name='passwordLogin'
                className='flex-1 text-sm bg-transparent outline-none'
                placeholder='$Password123'
                autoComplete='current-password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='p-1'
              >
                {showPassword ? (
                  <Image
                    alt='eye-close'
                    width={24}
                    height={24}
                    src={EyeCloseIcon}
                    style={{
                      filter: "grayscale(1) brightness(0.7) opacity(0.6)",
                    }}
                  />
                ) : (
                  <Image
                    alt='eye-open'
                    width={24}
                    height={24}
                    src={EyeOpenIcon}
                    style={{
                      filter: "grayscale(1) brightness(0.7) opacity(0.6)",
                    }}
                  />
                )}
              </button>
            </div>
            <ErrorMessage
              name='passwordLogin'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          <Btn
            type='submit'
            className='w-full py-3 mt-2'
            disabled={isSubmitting}
          >
            Sign in
          </Btn>
          <p className='text-gray-400 w-full text-center'>Or</p>
          <Btn type='button' onClick={onGoogleLogin} className='w-full py-3'>
            Sign in with Google
          </Btn>
        </Form>
      )}
    </Formik>
  );
};

// Register Component
const Register = ({ onRegisterSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Formik
      initialValues={{
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        fee: "",
        phone: "",
        address: "",
        degree: "",
      }}
      validationSchema={registerSchema}
      validateOnChange
      validateOnBlur
      onSubmit={onRegisterSuccess}
    >
      {({
        isSubmitting,
        errors,
        touched,
        values,
        setFieldValue,
        isValid,
        dirty,
      }) => (
        <Form className='space-y-4'>
          {/* Name */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>
              Full name *
            </label>
            <Field
              type='text'
              name='name'
              autoComplete='name'
              value={values.name}
              className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name && touched.name
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
              placeholder='Your full name'
            />
            <ErrorMessage
              name='name'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          {/* Email */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>Email *</label>
            <Field
              type='email'
              name='email'
              autoComplete='email'
              value={values.email}
              className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email && touched.email
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
              placeholder='you@example.com'
            />
            <ErrorMessage
              name='email'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className='block text-xs text-gray-600 mb-2'>I am a *</label>
            <div className='flex gap-3'>
              <label
                className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  values.role === "patient"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Field
                  type='radio'
                  name='role'
                  value='patient'
                  className='sr-only'
                />
                <span className='text-sm font-medium text-gray-700'>
                  Patient
                </span>
              </label>

              <label
                className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  values.role === "doctor"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Field
                  type='radio'
                  name='role'
                  value='doctor'
                  className='sr-only'
                />
                <span className='text-sm font-medium text-gray-700'>
                  Doctor
                </span>
              </label>
            </div>
            <ErrorMessage
              name='role'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          {/* Consultation Fee (only for doctors) */}
          {values.role === "doctor" && (
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Consultation Fee &#8377; *
              </label>
              <Field
                type='text'
                name='fee'
                autoComplete='off'
                value={values.fee}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fee && touched.fee
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
                placeholder='500'
              />
              <ErrorMessage
                name='fee'
                component='div'
                className='text-xs text-red-600 mt-1'
              />
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>
              Phone Number *
            </label>

            <PhoneInput
              country={"us"}
              value={values.phone}
              onChange={(phone) => {
                setFieldValue("phone", phone || "");
              }}
              inputProps={{
                name: "phone",
                required: true,
                autoComplete: "tel",
                className: `!w-full !h-10 !pl-12 !pr-3 !py-2 !text-gray-700 !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500  ${
                  errors.phone && touched.phone
                    ? "!border-red-300"
                    : "!border-gray-200"
                }`,
              }}
              containerClass='!w-full'
              buttonClass={`!absolute !top-0 !bottom-0 !left-0 !w-12 !h-full !flex !items-center !justify-center !bg-gray-50 hover:!bg-gray-100 !border-r !border-gray-300 !rounded-l-md ${
                errors.phone && touched.phone
                  ? "!border-red-300"
                  : "!border-gray-200"
              }`}
              dropdownClass='!absolute !left-0 !mt-1 !w-64 !bg-white !shadow-lg !rounded-md !max-h-60 !overflow-y-auto !z-50 !border !border-gray-200'
              searchClass='!w-full !border !border-gray-300 !px-3 !py-2 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !m-2'
            />

            <ErrorMessage
              name='phone'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          {/* Address */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>
              Address *
            </label>
            <Field
              as='textarea'
              name='address'
              autoComplete='street-address'
              value={values.address}
              className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.address && touched.address
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
              placeholder='Your complete address'
              rows='2'
            />
            <ErrorMessage
              name='address'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          {/* Degree (only for doctors) */}
          {values.role === "doctor" && (
            <div>
              <label className='block text-xs text-gray-600 mb-1'>
                Degree *
              </label>
              <Field
                type='text'
                name='degree'
                autoComplete='off'
                value={values.degree}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.degree && touched.degree
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
                placeholder='MBBS, MD, etc.'
              />
              <ErrorMessage
                name='degree'
                component='div'
                className='text-xs text-red-600 mt-1'
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>
              Password *
            </label>
            <div className='flex gap-1 w-full'>
              <div
                className={`flex items-center    focus-within:ring-2 focus-within:ring-blue-500 w-full border rounded-lg bg-white px-1 py-1 ${
                  errors.password && touched.password
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
              >
                <Field
                  type={showPassword ? "text" : "password"}
                  name='password'
                  autoComplete='new-password'
                  value={values.password}
                  className={`w-full text-smrounded-lg px-3  outline-none `}
                  placeholder='Choose a password'
                />
                <button
                  className='p-1'
                  onClick={() => setShowPassword(!showPassword)}
                  type='button'
                >
                  {showPassword ? (
                    <Image
                      alt='eye-close'
                      width={24}
                      height={24}
                      src={EyeCloseIcon}
                      style={{
                        filter: "grayscale(1) brightness(0.7) opacity(0.6)",
                      }}
                    />
                  ) : (
                    <Image
                      alt='eye-close'
                      width={24}
                      height={24}
                      src={EyeOpenIcon}
                      style={{
                        filter: "grayscale(1) brightness(0.7) opacity(0.6)",
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
            <ErrorMessage
              name='password'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>
              Confirm password *
            </label>
            <Field
              type='password'
              name='confirmPassword'
              autoComplete='new-password'
              value={values.confirmPassword}
              className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-300"
                  : "border-gray-200"
              }`}
              placeholder='Repeat your password'
            />
            <ErrorMessage
              name='confirmPassword'
              component='div'
              className='text-xs text-red-600 mt-1'
            />
          </div>

          <Btn
            variant='primary'
            type='submit'
            className={`w-full py-3 mt-6 ${
              !isValid || !dirty || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={!isValid || !dirty || isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Btn>
        </Form>
      )}
    </Formik>
  );
};

// Main Page Component
const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState("login");

  const loadUserDetails = async (user) => {
    if (!user?.uid) return null;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch {
      return null;
    }
  };

  const checkUserRole = async (user) => {
    const userData = await loadUserDetails(user);

    if (userData?.role) {
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("isLoggedIn", true);
      router.push("/home");
    } else {
      alert("Please complete your profile");
      await signOut(auth);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    await checkUserRole(result.user);
  };

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        values.emailLogin,
        values.passwordLogin
      );
      await checkUserRole(result.user);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      await updateProfile(result.user, {
        displayName: values.name,
      });

      const userData = {
        uid: result.user.uid,
        role: values.role,
        fee: values.fee || "",
        email: values.email,
        displayName: values.name,
        phoneNumber: values.phone,
        address: values.address,
        createdAt: new Date().toISOString(),
      };

      if (values.role === "doctor") {
        userData.degree = values.degree;
      }

      await setDoc(doc(db, "users", result.user.uid), userData);
      localStorage.setItem("userRole", values.role);
      localStorage.setItem("isLoggedIn", true);
      router.push("/home");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
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

        {mode === "login" ? (
          <Login
            onSwitchToRegister={() => setMode("register")}
            onLoginSuccess={handleLoginSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        ) : (
          <Register onRegisterSuccess={handleRegisterSubmit} />
        )}

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
