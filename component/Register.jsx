"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Image from "next/image";
import { EyeCloseIcon, EyeOpenIcon } from "@/assets/icon";
import Btn from "./Btn";
export const Register = ({
  onRegisterSuccess,
  registerSchema,
  passwordRules,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [list, setList] = useState(false);

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        confirmPassword: "",
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

        isValid,
        dirty,
      }) => (
        <Form className='space-y-4'>
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

          {/* Password */}
          <div>
            <label className='block text-xs text-gray-600 mb-1'>
              Password *
            </label>
            <div className='flex gap-1 w-full'>
              <div
                className={`flex items-center focus-within:ring-2 focus-within:ring-blue-500 w-full border rounded-lg bg-white px-1 py-1 ${
                  errors.password && touched.password
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
              >
                <Field
                  type={showPassword ? "text" : "password"}
                  name='password'
                  autoComplete='new-password'
                  onFocus={() => setList(true)}
                  onBlur={() => setList(false)}
                  value={values.password}
                  className='w-full text-sm rounded-lg px-3 outline-none '
                  placeholder='Choose a password'
                />
                <button
                  className='p-1'
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
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
            </div>

            <div className={`mt-2 space-y-1 ${!list ? "hidden" : "block"}`}>
              {passwordRules.map((rule, idx) => {
                const passed = rule.test(values.password || "");
                return (
                  <div key={idx} className='flex items-center text-sm '>
                    <span className='mr-2'>{passed ? "✅" : "❌"}</span>
                    <span
                      className={passed ? "text-green-600" : "text-red-600"}
                    >
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
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
