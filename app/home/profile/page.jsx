"use client";

import { ArrowLeft, Search, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../lib/firebase";
export default function DoctorProfile() {
  const [activeTab, setActiveTab] = useState("sent");
  const [searchName, setSearchName] = useState("");
  const [searchDiagnosis, setSearchDiagnosis] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(doctor);
  const availability = [
    { day: "Mon", time: "14:00 - 16:00" },
    { day: "Tue", time: "00:00 - 00:00" },
    { day: "Wed", time: "00:00 - 00:00" },
    { day: "Thur", time: "00:00 - 00:00" },
    { day: "Fri", time: "00:00 - 00:00" },
    { day: "Sat", time: "00:00 - 00:00" },
    { day: "Sun", time: "00:00 - 00:00" },
  ];
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    if (!uid) return;

    const fetchDoctorProfile = async () => {
      try {
        // 1️⃣ Read session document
        const sessionSnap = await getDoc(doc(db, "userSessions", uid));
        const selectedDoctorId = sessionSnap.data()?.selectedDoctorId;

        if (!selectedDoctorId) {
          setLoading(false);
          return;
        }

        // 2️⃣ Fetch doctor profile
        const doctorSnap = await getDoc(doc(db, "users", selectedDoctorId));

        if (doctorSnap.exists()) {
          const data = doctorSnap.data();

          // 3️⃣ Normalize data (IMPORTANT)
          setDoctor({
            id: selectedDoctorId,
            name: data.name || "",
            verified: Boolean(data.verified),
            totalExperience: data.totalExperience || "0 YEARS",
            coreExperience: data.coreExperience || "0 YEARS",
            consultationFees:
              typeof data.step5?.consultationFee === "number"
                ? data.step5.consultationFee
                : "",
            address: data.address || "",
            registrationNo: data.registrationNo || "",
            medicalCouncil: data.medicalCouncil || "",
            speciality:
              typeof data.speciality === "string"
                ? data.speciality
                : data.speciality?.subject || "",
            superSpeciality: data.superSpeciality?.subject || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [uid]);
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>Loading profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>No doctor profile selected</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <nav className='flex items-center text-sm text-gray-600 mb-4'>
            <span className='hover:text-gray-900 cursor-pointer'>
              Dashboard
            </span>
            <span className='mx-2'>/</span>
            <span className='text-gray-900'>Profile</span>
          </nav>
        </div>
      </div>

      {/* Alert Banner */}
      <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
        <div className='max-w-7xl mx-auto'>
          <p className='text-yellow-800 text-sm'>
            Your account will be functional once registration details are
            verified by Cureboon
          </p>
        </div>
      </div>

      <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-2'>
        <div className='max-w-7xl mx-auto'>
          <p className='text-yellow-800 text-sm'>
            You can send / receive request only on uploading registration number
            in your profile.
          </p>
        </div>
      </div>

      {/* Doctor Profile Header */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button className='p-2 hover:bg-gray-100 rounded-full'>
                <ArrowLeft className='w-5 h-5' />
              </button>

              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {doctor.name}
                </h1>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-gray-600'>ID- {doctor.id}</span>
                  {doctor.verified && (
                    <div className='relative group'>
                      <CheckCircle className='w-5 h-5 text-green-500' />
                      <div className='absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 w-64 bottom-full mb-2 left-0 z-10'>
                        All the required details of the doctor have been
                        verified by Cureboon.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button className='px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed opacity-50'>
              Send Request
            </button>
          </div>

          {/* Doctor Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>
                TOTAL EXPERIENCE
              </p>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                {doctor.totalExperience}
              </p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>
                CORE EXPERIENCE
              </p>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                {doctor.coreExperience}
              </p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>
                CONSULTATION FEES
              </p>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                ₹{doctor.consultationFees}
              </p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>ADDRESS</p>
              <p className='text-sm text-gray-900 mt-1'>{doctor.address}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>
                REGISTRATION NO.
              </p>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                {doctor.registrationNo}
              </p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>
                MEDICAL COUNCIL
              </p>
              <p className='text-lg font-bold text-gray-900 mt-1'>
                {doctor.medicalCouncil}
              </p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>SPECIALITY</p>
              <p className='text-sm text-gray-900 mt-1'>{doctor.speciality}</p>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-xs text-gray-600 font-semibold'>
                SUPER SPECIALITY
              </p>
              <p className='text-sm text-gray-900 mt-1'>
                {doctor.superSpeciality}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            AVAILABILITY AND TIME
          </h2>
          <p className='text-sm text-gray-600 mb-4'>Availability Details</p>

          <div className='grid grid-cols-2 md:grid-cols-7 gap-3'>
            {availability.map((slot, index) => (
              <div key={index} className='border rounded-lg overflow-hidden'>
                <div className='bg-[#1C398E] text-white text-center py-2 font-semibold'>
                  {slot.day}
                </div>
                <div className='p-3 text-center bg-gray-50'>
                  <p className='text-xs text-gray-600'>{slot.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests Section */}
        <div className='bg-white rounded-lg shadow mt-6'>
          <div className='border-b'>
            <div className='flex'>
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "sent"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Requests Sent (0)
              </button>
              <button
                onClick={() => setActiveTab("received")}
                className={`flex-1 py-4 px-6 text-center font-medium ${
                  activeTab === "received"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Requests Received (0)
              </button>
            </div>
          </div>

          <div className='p-6'>
            <p className='text-gray-900 font-semibold mb-4'>
              {activeTab === "sent" ? "0 Patients" : "0 Cases"}
            </p>

            {/* Search Filters */}
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-6'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by Name/ID'
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                />
              </div>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by Diagnosis'
                  value={searchDiagnosis}
                  onChange={(e) => setSearchDiagnosis(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                />
              </div>
              <input
                type='date'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
              />
              <select className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'>
                <option value=''>Total Cases</option>
                <option value='5'>Followup within 5 days</option>
                <option value='6'>Followup more than 5 days to 6 months</option>
                <option value='100'>Followup more than 6 months</option>
              </select>
              <select className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'>
                <option value=''>Gender</option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
              </select>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      NAME/ID
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      DATE
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      DIAGNOSIS
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      AGE/GENDER
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      {activeTab === "sent"
                        ? "ADVISING DOCTOR"
                        : "CONSULTED BY"}
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      FOLLOWUP
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase'>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan='7' className='text-center py-20'>
                      <p className='text-3xl text-gray-400'>
                        {activeTab === "sent"
                          ? "No requests sent"
                          : "No requests received"}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
