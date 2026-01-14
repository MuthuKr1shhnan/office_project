import Accordion from "../../component/Accordion";
import Btn from "../../component/Btn";
import { useQualificationStep } from "../../hooks/useQualificationStep";
import { Formik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Step2({ handleNext }) {
  const { openSection, toggleSection } = useQualificationStep();
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  // Options arrays
  const councils = [
    { value: "TNMC", label: "Tamil Nadu Medical Council" },
    { value: "KMC", label: "Karnataka Medical Council" },
    { value: "MMC", label: "Maharashtra Medical Council" },
    { value: "DMC", label: "Delhi Medical Council" },
  ];

  const years = Array.from({ length: 50 }).map((_, i) => {
    const year = new Date().getFullYear() - i;
    return year;
  });

  const specialities = [
    "General Medicine",
    "General Surgery",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Psychiatry",
    "ENT",
    "Ophthalmology",
    "Gynecology",
  ];

  const superSpecialities = [
    "Cardiology",
    "Neurology",
    "Nephrology",
    "Oncology",
    "Gastroenterology",
    "Endocrinology",
    "Urology",
    "Plastic Surgery",
  ];

  const initialValues = {
    regNumber: "",
    council: "",
    regYear: "",
    speciality: "",
    specialityYear: "",
    superSpeciality: "",
    superSpecialityYear: "",
  };

  const validationSchema = Yup.object({
    regNumber: Yup.string().required("Registration number is required"),
    council: Yup.string().required("State medical council is required"),
    regYear: Yup.string().required("Registration year is required"),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        if (!uid) return;

        const step2Data = {
          graduation: {
            regNumber: values.regNumber,
            council: values.council,
            regYear: values.regYear,
          },
          speciality: values.speciality
            ? {
                subject: values.speciality,
                year: values.specialityYear,
              }
            : null,
          superSpeciality: values.superSpeciality
            ? {
                subject: values.superSpeciality,
                year: values.superSpecialityYear,
              }
            : null,
        };

        // remove null objects (Firestore-safe)
        Object.keys(step2Data).forEach(
          (key) => step2Data[key] === null && delete step2Data[key]
        );

        await setDoc(
          doc(db, "tempUsers", uid),
          {
            ...step2Data,
            updatedAt: Date.now(),
          },
          { merge: true }
        );

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
        <div className='space-y-4'>
          {/* Title */}
          <div>
            <h2 className='text-lg font-semibold text-slate-800'>
              Please Fill Up your Qualification Details
            </h2>
            <p className='text-sm text-red-500 mt-1'>
              * Minimum Qualification Required – MBBS
            </p>
          </div>

          {/* GRADUATION */}
          <Accordion
            title='Graduation'
            isOpen={openSection === "graduation"}
            onClick={() => toggleSection("graduation")}
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  MBBS Registration Number *
                </label>
                <input
                  name='regNumber'
                  value={values.regNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className='w-full px-4 py-3 border rounded-lg'
                  placeholder='Enter the Registration No.'
                />
                {touched.regNumber && errors.regNumber && (
                  <p className='text-xs text-red-600'>{errors.regNumber}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  State Medical Council *
                </label>
                <select
                  name='council'
                  value={values.council}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className='w-full px-4 py-3 border rounded-lg'
                >
                  <option value=''>Select State</option>
                  {councils.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {touched.council && errors.council && (
                  <p className='text-xs text-red-600'>{errors.council}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Year of Registration *
                </label>
                <select
                  name='regYear'
                  value={values.regYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className='w-full px-4 py-3 border rounded-lg'
                >
                  <option value=''>Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {touched.regYear && errors.regYear && (
                  <p className='text-xs text-red-600'>{errors.regYear}</p>
                )}
              </div>

              <Btn variant='primary' className='px-6 py-2'>
                Save
              </Btn>
            </div>
          </Accordion>

          {/* SPECIALITY */}
          <Accordion
            title='Speciality'
            isOpen={openSection === "speciality"}
            onClick={() => toggleSection("speciality")}
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Subject
                </label>
                <select
                  name='speciality'
                  value={values.speciality}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border rounded-lg'
                >
                  <option value=''>Select Subject</option>
                  {specialities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Year of Specialization
                </label>
                <select
                  name='specialityYear'
                  value={values.specialityYear}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border rounded-lg'
                >
                  <option value=''>Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Btn variant='primary' className='px-6 py-2'>
                Save
              </Btn>
            </div>
          </Accordion>

          {/* SUPER SPECIALITY */}
          <Accordion
            title='Super Speciality'
            isOpen={openSection === "superSpeciality"}
            onClick={() => toggleSection("superSpeciality")}
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Subject
                </label>
                <select
                  name='superSpeciality'
                  value={values.superSpeciality}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border rounded-lg'
                >
                  <option value=''>Select Subject</option>
                  {superSpecialities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Year of Super Specialization
                </label>
                <select
                  name='superSpecialityYear'
                  value={values.superSpecialityYear}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border rounded-lg'
                >
                  <option value=''>Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <Btn variant='primary' className='px-6 py-2'>
                Save
              </Btn>
            </div>
          </Accordion>

          {/* NEXT */}
          <Btn
            variant='primary'
            onClick={() => {
              setTouched({
                regNumber: true,
                council: true,
                regYear: true,
              });
              submitForm();
            }}
            className='w-full'
          >
            Next
          </Btn>

          <p className='text-center text-sm text-slate-500'>
            Please provide true and up to date information
          </p>
        </div>
      )}
    </Formik>
  );
}
