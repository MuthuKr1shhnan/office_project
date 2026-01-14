import { Formik } from "formik";
import * as Yup from "yup";
import Btn from "../../component/Btn";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase"; // adjust path
import { onAuthStateChanged } from "firebase/auth";

export default function Step4({ handleNext }) {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);
  const initialValues = {
    highestDegreeExperience: "",
    totalExperience: "",
  };

  const validationSchema = Yup.object({
    highestDegreeExperience: Yup.string().required(
      "Experience in highest degree is required"
    ),
    totalExperience: Yup.string().required("Total experience is required"),
  });

  const saveStep4 = async (values) => {
    const experience = {
      highestDegreeExperience: values.highestDegreeExperience,
      totalExperience: values.totalExperience,
      updatedAt: Date.now(),
    };

    // 🔒 sanitize payload
    Object.keys(experience).forEach(
      (key) => experience[key] === "" && delete experience[key]
    );

    await setDoc(
      doc(db, "tempUsers", uid),
      { step4: experience },
      { merge: true }
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await saveStep4(values);
        handleNext();
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        submitForm,
        setTouched,
      }) => (
        <div className='bg-white p-6 md:p-8'>
          <div className='mb-10'>
            <h2 className='text-xl font-semibold text-blue-900'>
              Let us know about your experience
            </h2>
          </div>

          <div className='space-y-8'>
            {/* Highest Degree */}
            <div>
              <label className='text-blue-900 font-medium mb-2 block'>
                Experience in highest degree or diploma
                <span className='text-red-500'>*</span>
              </label>

              <select
                name='highestDegreeExperience'
                value={values.highestDegreeExperience}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full px-4 py-4 border rounded-xl'
              >
                <option value=''>Select Experience</option>
                <option value='0-1'>0 – 1 Years</option>
                <option value='1-3'>1 – 3 Years</option>
                <option value='3-5'>3 – 5 Years</option>
                <option value='5+'>5+ Years</option>
              </select>

              {touched.highestDegreeExperience &&
                errors.highestDegreeExperience && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.highestDegreeExperience}
                  </p>
                )}
            </div>

            {/* Total Experience */}
            <div>
              <label className='text-blue-900 font-medium mb-2 block'>
                Total Experience
                <span className='text-red-500'>*</span>
              </label>

              <select
                name='totalExperience'
                value={values.totalExperience}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full px-4 py-4 border rounded-xl'
              >
                <option value=''>Select Experience</option>
                <option value='0-1'>0 – 1 Years</option>
                <option value='1-3'>1 – 3 Years</option>
                <option value='3-5'>3 – 5 Years</option>
                <option value='5+'>5+ Years</option>
              </select>

              {touched.totalExperience && errors.totalExperience && (
                <p className='text-xs text-red-600 mt-1'>
                  {errors.totalExperience}
                </p>
              )}
            </div>
          </div>

          <div className='mt-12'>
            <Btn
              onClick={() => {
                setTouched({
                  highestDegreeExperience: true,
                  totalExperience: true,
                });
                submitForm();
              }}
              className='w-full py-4 text-white font-semibold'
            >
              Next
            </Btn>
          </div>
        </div>
      )}
    </Formik>
  );
}
