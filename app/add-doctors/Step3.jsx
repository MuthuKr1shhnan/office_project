import Btn from "../../component/Btn";
import { useState } from "react";
export default function Step3() {
  const [activeDoc, setActiveDoc] = useState();
  const docLabels = {
    idCard: "Upload Id Card (Any government issued photo id card)",
    mbbs: "Upload MBBS Registration",
    md: "Upload MD / Diploma / DNB",
    super: "Upload Super Speciality",
    signature: "Upload Signature",
  };
  return (
    <div className='bg-white   p-6 md:p-8'>
      {/* Header */}

      {/* Title */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-blue-900 mb-2'>
          Add your account details & upload all the required documents for the
          verification Process
        </h2>
        <p className='text-slate-600'>It can be updated later also.</p>
      </div>

      {/* Content */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Left Document List */}
        <div className='border rounded-xl overflow-hidden'>
          {[
            { key: "idCard", label: "Id Card *" },
            { key: "mbbs", label: "MBBS Registration *" },
            { key: "md", label: "MD/Diploma/DNB" },
            { key: "super", label: "DM/MCH/DNB Superspeciality" },
            { key: "signature", label: "SIGNATURE" },
          ].map((doc) => (
            <div
              key={doc.key}
              onClick={() => setActiveDoc(doc.key)}
              className={`flex items-center justify-between px-4 py-4 border-b cursor-pointer ${
                activeDoc === doc.key
                  ? "bg-slate-50 border-l-4 border-l-indigo-600"
                  : ""
              }`}
            >
              <span className='text-slate-700 font-medium'>{doc.label}</span>
              <svg
                className='w-5 h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Right Upload Box */}
        <div className='border-2 border-dashed rounded-xl flex items-center justify-center p-8 text-center'>
          <div>
            <p className='text-slate-700 font-medium mb-2'>
              {docLabels[activeDoc]}
            </p>
            <label className='text-red-500 cursor-pointer font-medium'>
              Browse Computer
              <input type='file' hidden />
            </label>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className='mt-10'>
        <Btn
          variant={"primary"}
          className='w-full py-4 text-white font-semibold '
        >
          Next
        </Btn>
      </div>

      {/* Footer Note */}
      <p className='text-center text-sm text-slate-500 mt-6'>
        Please provide true and up to date information
      </p>
    </div>
  );
}
