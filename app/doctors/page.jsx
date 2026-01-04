"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "../globals.css";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  search as Search,
  verify,
  degree,
  LocationIcon as location,
  phone,
} from "../../assets/icon";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [userProfile, setUserProfile] = useState(null);

  const [requestStatus, setRequestStatus] = useState({});

  const usersCollectionRef = collection(db, "users");

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  /* ---------------- LOAD USER PROFILE ---------------- */
  useEffect(() => {
    if (!user) return;

    const loadUserProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserProfile(snap.data());
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };

    loadUserProfile();
  }, [user]);

  /* ---------------- FETCH DOCTORS ---------------- */
  useEffect(() => {
    const getDoctorList = async () => {
      try {
        const q = query(usersCollectionRef, where("role", "==", "doctor"));
        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDoctors(list);
      } catch (err) {
        console.error("Error loading doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    getDoctorList();
  });

  /* ---------------- FETCH USER REQUEST STATUS ---------------- */
  useEffect(() => {
    if (!user) return;

    const loadRequests = async () => {
      try {
        const q = query(
          collection(db, "consultations"),
          where("patientId", "==", user.uid)
        );

        const snap = await getDocs(q);
        const statusMap = {};

        snap.docs.forEach((doc) => {
          const data = doc.data();
          statusMap[data.doctorId] = data.status;
        });

        setRequestStatus(statusMap);
      } catch (err) {
        console.error("Error loading consultation status:", err);
      }
    };

    loadRequests();
  }, [user]);

  /* ---------------- SEND REQUEST ---------------- */
  const sendRequest = async (doctor) => {
    try {
      if (!user) {
        alert("Please login as a patient to send a request.");
        return;
      }

      const doctorUid = doctor.uid || doctor.userId || doctor.id;

      if (!doctorUid) {
        alert("Doctor UID missing.");
        return;
      }

      await addDoc(collection(db, "consultations"), {
        doctorId: doctorUid,
        patientId: user.uid,

        patientName:
          userProfile?.displayName || user.displayName || "Anonymous",
        patientEmail: userProfile?.email || user.email || "",
        patientPhone: userProfile?.phoneNumber || "",

        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Update UI instantly
      setRequestStatus((prev) => ({
        ...prev,
        [doctorUid]: "pending",
      }));
    } catch (err) {
      console.error("Failed to send request:", err);
      alert("Failed to send request.");
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.displayName?.toLowerCase().includes(q) ||
      doc.phoneNumber?.includes(q) ||
      doc.degree?.toLowerCase().includes(q) ||
      doc.address?.toLowerCase().includes(q)
    );
  });

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className='w-full mt-auto h-full justify-center items-center bg-white rounded-xl p-12 flex flex-col gap-4'>
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4'></div>
          <p className='text-gray-500'>Loading doctors...</p>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-12'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2'>
            Find Your Doctor
          </h1>
          <p className='text-slate-600'>
            Search and connect with verified doctors
          </p>
        </div>

        {/* Search Bar */}
        <div className='mb-8'>
          <div className='relative'>
            <div className='flex'>
              <input
                type='text'
                placeholder='Search by Name, Phone, Degree or Location...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full bg-white border-2 border-slate-200 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-slate-700 placeholder:text-slate-400'
              />
              <Image
                src={Search}
                alt='search'
                className='absolute right-[1%] top-[35%]'
              />
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className='space-y-6'>
          {filteredDoctors.map((doctor) => {
            const doctorUid = doctor.uid || doctor.userId || doctor.id;
            const status = requestStatus[doctorUid];

            const isDisabled = Boolean(status);
            const buttonText = status
              ? status.charAt(0).toUpperCase() + status.slice(1)
              : "Send Request";

            const buttonColor = status
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700";

            return (
              <div
                key={doctor.id}
                className='
                  bg-white
                  rounded-2xl
                  p-6
                  flex
                  flex-col
                  md:flex-row
                  gap-6
                  items-start
                  border
                  border-slate-200
                  shadow-lg
                  hover:shadow-xl
                  transition-all
                  duration-300
                  group
                '
              >
                {/* Doctor Avatar */}
                <div className='relative shrink-0'>
                  <div className='w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md ring-2 ring-indigo-100'>
                    {doctor.photoURL ? (
                      <Image
                        src={doctor.photoURL}
                        alt={doctor.displayName || "Doctor"}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold'>
                        {doctor.displayName?.charAt(0).toUpperCase() || "D"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className='flex-1 min-w-0'>
                  {/* Name and Verification */}
                  <div className='flex items-center gap-2 mb-3'>
                    <h2 className='font-bold text-xl text-slate-800'>
                      {doctor.displayName || "Doctor"}
                    </h2>
                    {true && (
                      <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-100'>
                        <Image
                          src={verify}
                          width={24}
                          height={24}
                          alt='verify'
                        />
                      </div>
                    )}
                  </div>

                  {/* Doctor Details */}
                  <div className='space-y-2'>
                    {doctor.degree && (
                      <div className='flex items-center gap-3 text-sm text-slate-600'>
                        <div className='w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0'>
                          <Image src={degree} alt='degree' />
                        </div>
                        <span className='font-medium'>{doctor.degree}</span>
                      </div>
                    )}

                    {doctor.address && (
                      <div className='flex items-center gap-3 text-sm text-slate-600'>
                        <div className='w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0'>
                          <Image src={location} alt='phone' />
                        </div>
                        <span>{doctor.address}</span>
                      </div>
                    )}

                    {doctor.phoneNumber && (
                      <div className='flex items-center gap-3 text-sm text-slate-600'>
                        <div className='w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0'>
                          <Image src={phone} alt='phone' />
                        </div>
                        <span>{doctor.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Fee and Button */}
                  <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-100'>
                    {doctor.fee && (
                      <div className='flex items-center gap-2'>
                        <span className='text-slate-600 text-sm'>
                          Consultation Fee:
                        </span>
                        <span className='text-2xl font-bold bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                          ₹{doctor.fee}
                        </span>
                      </div>
                    )}

                    <button
                      disabled={isDisabled}
                      onClick={() => sendRequest(doctor)}
                      className={`
                        sm:ml-auto
                        px-6
                        py-3
                        text-white
                        rounded-xl
                        text-sm
                        font-semibold
                        transition-all
                        shadow-md
                        hover:shadow-lg
                        disabled:opacity-60
                        disabled:cursor-not-allowed
                        ${buttonColor}
                      `}
                    >
                      {buttonText}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDoctors.length === 0 && (
          <div className='bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-200'>
            <div className='w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Image
                src={Search}
                alt='search
              '
              />
            </div>
            <p className='text-slate-600 text-lg'>
              No doctors found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
