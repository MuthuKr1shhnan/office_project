import Btn from "../../component/Btn";
import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Step5({ handleNext }) {
  const [consultationFee, setConsultationFee] = useState("");
  const [uploadFee, setUploadFee] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [errors, setErrors] = useState({});
  const [uid, setUid] = useState(null); // ✅ FIX

  const days = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  const [availability, setAvailability] = useState(
    days.reduce((acc, day) => {
      acc[day] = [{ from: "", to: "" }];
      return acc;
    }, {})
  );

  /* -------------------- Availability Logic -------------------- */

  const addSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { from: "", to: "" }],
    }));
  };

  const removeSlot = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (day, index, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  /* -------------------- Validation -------------------- */

  const validate = () => {
    const newErrors = {};

    if (!consultationFee || Number(consultationFee) <= 0) {
      newErrors.consultationFee = "Consultation fee is required";
    }

    if (uploadFee === null) {
      newErrors.uploadFee = "Please select a data uploading fee";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- Firestore Save -------------------- */

  const saveStep5Data = async () => {
    if (!uid) return;

    // remove empty availability slots
    const cleanedAvailability = {};

    Object.keys(availability).forEach((day) => {
      const validSlots = availability[day].filter(
        (slot) => slot.from && slot.to
      );
      if (validSlots.length > 0) {
        cleanedAvailability[day] = validSlots;
      }
    });

    const step5Data = {
      consultationFee: Number(consultationFee),
      uploadFee,
      referralCode: referralCode || null,
      availability: cleanedAvailability,
      updatedAt: Date.now(),
    };

    // remove null / empty values
    Object.keys(step5Data).forEach((key) => {
      if (
        step5Data[key] === null ||
        step5Data[key] === "" ||
        (typeof step5Data[key] === "object" &&
          Object.keys(step5Data[key]).length === 0)
      ) {
        delete step5Data[key];
      }
    });

    await setDoc(
      doc(db, "tempUsers", uid),
      { step5: step5Data },
      { merge: true }
    );
  };

  const onNextClick = async () => {
    if (!validate()) return;

    await saveStep5Data();
    handleNext();
  };

  /* -------------------- UI (UNCHANGED) -------------------- */

  return (
    <div className='p-6 md:p-8'>
      {/* Consultation Fees */}
      <h3 className='text-blue-900 font-semibold mb-4'>Consultation Fees</h3>

      <label className='text-blue-900 font-medium mb-2 block'>
        Enter your consultation fees (INR){" "}
        <span className='text-red-500'>*</span>
      </label>

      <div className='flex border rounded-lg overflow-hidden'>
        <input
          type='number'
          className='flex-1 px-4 py-3 outline-none'
          placeholder='Enter consultation fees'
          value={consultationFee}
          onChange={(e) => setConsultationFee(e.target.value)}
        />
        <div className='px-4 py-3 bg-slate-50 text-slate-600 border-l'>
          Per Consultation
        </div>
      </div>

      {errors.consultationFee && (
        <p className='text-red-500 text-sm mt-1'>{errors.consultationFee}</p>
      )}

      {/* Upload Fee */}
      <h3 className='text-blue-900 font-semibold mt-8 mb-4'>
        Data Uploading Fees
      </h3>

      <p className='text-blue-900 font-medium mb-3'>
        Select from the following (INR) <span className='text-red-500'>*</span>
      </p>

      <div className='flex gap-8'>
        {[0, 50, 100].map((fee) => (
          <label key={fee} className='flex items-center gap-2 cursor-pointer'>
            <input
              type='radio'
              name='uploadFee'
              className='hidden'
              checked={uploadFee === fee}
              onChange={() => setUploadFee(fee)}
            />
            <div className='w-5 h-5 rounded-full border-2 flex items-center justify-center border-gray-400'>
              {uploadFee === fee && (
                <div className='w-2.5 h-2.5 bg-indigo-600 rounded-full' />
              )}
            </div>
            <span>Rs {fee}</span>
          </label>
        ))}
      </div>

      {errors.uploadFee && (
        <p className='text-red-500 text-sm mt-1'>{errors.uploadFee}</p>
      )}

      {/* Availability */}
      <h3 className='text-blue-900 font-semibold mt-10 mb-6'>
        Set Your Availability Day and Time (Optional)
      </h3>

      <div className='space-y-4'>
        {days.map((day) => (
          <div
            key={day}
            className='grid grid-cols-[80px_1fr] gap-4 items-start'
          >
            <div className='w-20 bg-blue-900 text-white text-center py-3 rounded font-medium'>
              {day}
            </div>

            <div className='flex-1 flex flex-col gap-3'>
              {availability[day].map((slot, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <input
                    type='time'
                    value={slot.from}
                    onChange={(e) =>
                      handleTimeChange(day, index, "from", e.target.value)
                    }
                    className='border px-3 py-2 rounded w-32'
                  />

                  <span>–</span>

                  <input
                    type='time'
                    value={slot.to}
                    onChange={(e) =>
                      handleTimeChange(day, index, "to", e.target.value)
                    }
                    className='border px-3 py-2 rounded w-32'
                  />

                  {availability[day].length > 1 && (
                    <button
                      onClick={() => removeSlot(day, index)}
                      className='text-red-500 text-lg'
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => addSlot(day)}
                className='text-red-500 font-medium w-fit'
              >
                + Add time slot
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div className='mt-10'>
        <label className='text-blue-900 font-medium mb-2 block'>
          Referral code (Optional)
        </label>

        <input
          type='text'
          placeholder='Enter referral code'
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className='w-full px-4 py-3 border rounded-lg'
        />
      </div>

      {/* Next */}
      <Btn
        className='w-full mt-10 py-4'
        variant='primary'
        onClick={onNextClick}
      >
        Next
      </Btn>

      <p className='text-center text-sm text-slate-600 mt-6'>
        Please provide true and up to date information
      </p>
    </div>
  );
}
