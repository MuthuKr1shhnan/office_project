import Btn from "../../component/Btn";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Formik, ErrorMessage } from "formik";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { validationSchema } from "../../utils/validators";

export default function Step1({ handleNext, isMBBS }) {
  const [uid, setUid] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  const states = ["Tamil Nadu", "Karnataka", "Kerala"];
  const cities = {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Karnataka: ["Bangalore", "Mysore"],
    Kerala: ["Kochi", "Trivandrum"],
  };

  const initialValues = {
    name: "",
    email: "doctor@example.com",
    mobileNumber: "",
    address: "",
    state: "",
    city: "",
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validate={() => {
        const errors = {};
        if (isMBBS === null) {
          errors.isMBBS = "Please select MBBS option";
        }
        return errors;
      }}
      onSubmit={async (values) => {
        if (!uid) return;
        const step1Data = {
          name: values.name,
          mobileNumber: values.mobileNumber,
          address: values.address,
          state: values.state,
          city: values.city,
          updatedAt: Date.now(),
        };
        try {
          await setDoc(doc(db, "tempUsers", uid), step1Data, { merge: true });
          handleNext();
        } catch (err) {
          console.error(err.message);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        submitForm,
        setTouched,
      }) => (
        <div>
          <div className='space-y-5'>
            {/* Name */}
            <div>
              <label className='block text-sm font-medium mb-1'>
                Name <span className='text-red-500'>*</span>
              </label>
              <div className='flex'>
                <span className='px-4 py-3 bg-slate-50 border rounded-l-xl'>
                  Dr.
                </span>
                <input
                  name='name'
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className='flex-1 px-4 py-3 border rounded-r-xl'
                  placeholder='Enter your name'
                />
              </div>
              {touched.name && errors.name && (
                <p className='text-red-600 text-xs'>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium mb-1'>Email</label>
              <input
                value={values.email}
                disabled
                className='w-full px-4 py-3 border rounded-xl bg-slate-100'
              />
            </div>

            {/* Mobile */}
            <div>
              <label className='block text-sm font-medium mb-1'>
                Mobile Number *
              </label>
              <PhoneInput
                country='IN'
                value={values.mobileNumber}
                onChange={(value) => setFieldValue("mobileNumber", value)}
                onBlur={() => setFieldTouched("mobileNumber", true)}
                className={`w-full h-10 px-3 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.mobileNumber && touched.mobileNumber
                    ? "border-red-300"
                    : "border-gray-200"
                }`}
              />
              <ErrorMessage
                name='mobileNumber'
                component='p'
                className='text-xs text-red-600 mt-1'
              />
            </div>

            {/* Address */}
            <div>
              <label className='block text-sm font-medium mb-1'>
                Clinic Address *
              </label>
              <input
                name='address'
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full px-4 py-3 border rounded-xl'
              />
              {touched.address && errors.address && (
                <p className='text-red-600 text-xs'>{errors.address}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className='block text-sm font-medium mb-1'>State *</label>
              <select
                name='state'
                value={values.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full px-4 py-3 border rounded-xl'
              >
                <option value=''>Select State</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {touched.state && errors.state && (
                <p className='text-red-600 text-xs'>{errors.state}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className='block text-sm font-medium mb-1'>City *</label>
              <select
                name='city'
                value={values.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className='w-full px-4 py-3 border rounded-xl'
              >
                <option value=''>Select City</option>
                {(cities[values.state] || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {touched.city && errors.city && (
                <p className='text-red-600 text-xs'>{errors.city}</p>
              )}
            </div>

            {/* Profile Photo */}
            <div className='flex items-center gap-4'>
              <div className='w-24 h-24 rounded-xl border overflow-hidden'>
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt='Profile'
                    width={100}
                    height={100}
                    unoptimized
                  />
                ) : (
                  <div className='w-full h-full bg-slate-200' />
                )}
              </div>
              <label className='cursor-pointer px-4 py-2 border rounded-xl'>
                Upload Photo
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>

          {/* NEXT */}
          <Btn
            onClick={() => {
              setTouched({
                name: true,
                mobileNumber: true,
                address: true,
                state: true,
                city: true,
              });
              submitForm();
            }}
            variant='primary'
            className='w-full mt-8'
          >
            Next
          </Btn>
        </div>
      )}
    </Formik>
  );
}
