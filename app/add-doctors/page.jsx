"use client";

import { useState } from "react";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";

export default function DoctorRegistrationForm() {
  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);
  const [isMBBS, setIsMBBS] = useState(null);

  const [errors, setErrors] = useState({});

  /* ---------------- INPUT HANDLERS ---------------- */

  /* ---------------- VALIDATION ---------------- */

  /* ---------------- NAVIGATION ---------------- */

  const handleNext = () => {
    console.log("\x1b[33mIm clicked");

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className='w-full min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Progress Bar */}
        <div className='flex justify-between mb-8'>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 mx-1 rounded-full ${
                i + 1 <= currentStep
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className='bg-white rounded-2xl shadow-lg border p-6 md:p-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <button
              onClick={handleBack}
              className={`text-slate-500 ${
                currentStep === 1 ? "invisible" : ""
              }`}
            >
              ← Back
            </button>

            <h3 className='font-bold  flex-1 text-center text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
              Step {currentStep}/{totalSteps} – Personal Details
            </h3>

            <div />
            <button
              onClick={() =>
                setCurrentStep(
                  (currentStep < totalSteps && currentStep + 1) || 1
                )
              }
              className={`text-slate-500 ${
                currentStep === 0 || currentStep === totalSteps
                  ? "invisible"
                  : ""
              }`}
            >
              Skip →
            </button>
          </div>

          {/* MBBS */}
          <div className='mb-8'>
            <h2 className='text-xl font-bold text-center mb-4'>
              Are you an MBBS or Above Doctor?
            </h2>

            <div className='flex justify-center gap-4'>
              {["Yes", "No"].map((label, idx) => {
                const value = idx === 0; // true = Yes, false = No

                return (
                  <div
                    key={label}
                    onClick={() => setIsMBBS(value)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isMBBS === value
                        ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isMBBS === value
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-slate-300"
                      }`}
                    >
                      {isMBBS === value && (
                        <div className='w-2 h-2 rounded-full bg-white'></div>
                      )}
                    </div>

                    <label className='font-medium cursor-pointer text-slate-700'>
                      {label}
                    </label>
                  </div>
                );
              })}
            </div>

            {errors.isMBBS && (
              <p className='text-center text-red-600 text-sm mt-2'>
                {errors.isMBBS}
              </p>
            )}
          </div>

          <hr className='my-8 border-slate-200' />
          {/* FORM */}
          {isMBBS && currentStep === 1 && (
            <Step1 handleNext={() => handleNext()} isMBBS={isMBBS} />
          )}
          {isMBBS && currentStep === 2 && <Step2 handleNext={handleNext} />}

          {isMBBS && currentStep === 3 && <Step3 />}
          {isMBBS && currentStep === 4 && <Step4 handleNext={handleNext} />}
          {isMBBS && currentStep === 5 && <Step5 handleNext={handleNext} />}
          {isMBBS && currentStep === 6 && <Step6  />}
        </div>
      </div>
    </div>
  );
}
