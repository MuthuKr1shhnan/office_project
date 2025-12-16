"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleAuthProvider, db } from "../lib/firebase";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumber } from "libphonenumber-js";
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

// Validation Schemas
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const registerSchema = Yup.object({
  name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Name should contain only letters")
    .required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(12, "Password must be 12+ characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
  role: Yup.string()
    .oneOf(["patient", "doctor"], "Please select a role")
    .required("Please select a role"),
  fee: Yup.number().when("role", {
    is: "doctor",
    then: (schema) =>
      schema
        .typeError("Invalid amount! Enter valid number")
        .positive("Fee must be positive")
        .required("Consultation fee is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone: Yup.string()
    .test("is-valid-phone", "Enter a valid phone number", function (value) {
      if (!value) return false;
      try {
        const phoneNumber = parsePhoneNumber(`+${value}`);
        return phoneNumber.isValid();
      } catch (error) {
        return false;
      }
    })
    .required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  degree: Yup.string().when("role", {
    is: "doctor",
    then: (schema) => schema.required("Degree is required for doctors"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

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
        values.email,
        values.password
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
      router.push("/home");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
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
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            validateOnChange
            validateOnBlur
            onSubmit={handleLoginSubmit}
          >
            {({ isSubmitting }) => (
              <Form className='space-y-4' noValidate>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Email
                  </label>
                  <Field
                    type='email'
                    name='email'
                    className='w-full text-sm bg-white border rounded-lg px-3 py-2'
                    placeholder='you@example.com'
                  />
                  <ErrorMessage
                    name='email'
                    component='div'
                    className='text-xs text-red-600 mt-1'
                  />
                </div>

                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    Password
                  </label>
                  <Field
                    type='password'
                    name='password'
                    className='w-full text-sm bg-white border rounded-lg px-3 py-2'
                    placeholder='$Password123'
                  />
                  <ErrorMessage
                    name='password'
                    component='div'
                    className='text-xs text-red-600 mt-1'
                  />
                </div>

                <Btn
                  type='submit'
                  className='w-full py-3'
                  disabled={isSubmitting}
                >
                  Sign in
                </Btn>

                <Btn
                  type='button'
                  onClick={handleGoogleLogin}
                  className='w-full py-3'
                >
                  Sign in with Google
                </Btn>
              </Form>
            )}
          </Formik>
        ) : (
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
            onSubmit={handleRegisterSubmit}
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
                  <label className='block text-xs text-gray-600 mb-1'>
                    Email *
                  </label>
                  <Field
                    type='email'
                    name='email'
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
                  <label className='block text-xs text-gray-600 mb-2'>
                    I am a *
                  </label>
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
                    value={values.phone || ""}
                    onChange={(phone) => {
                      setFieldValue("phone", phone || "");
                    }}
                    inputProps={{
                      name: "phone",
                      required: true,
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
                  <Field
                    type='password'
                    name='password'
                    className={`w-full text-sm bg-white border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password && touched.password
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                    placeholder='Choose a password'
                  />
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
