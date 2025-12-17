"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "../globals.css";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  LocationIcon as location,
  TickIcon as tick,
  PhoneIcon as phone,
  DegreeIcon as degree,
} from "../../assets/icon";

import heroImage from "../../assets/heroimage.png";

const auth = getAuth();

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const usersCollectionRef = collection(db, "users");

  // Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch doctors
  useEffect(() => {
    const getDoctorList = async () => {
      try {
        const q = query(usersCollectionRef, where("role", "==", "doctor"));
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          id: doc.id, // Firestore doc id (not necessarily the auth UID)
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
  }, []);

  // Send consultation request
  const sendRequest = async (doctor) => {
    try {
      if (!user) {
        alert("Please login as a patient to send a request.");
        return;
      }

      // Choose the correct doctor UID field:
      // Prefer doctor.uid (auth UID). If not present, use doctor.userId.
      // If neither exists, fall back to doctor.id only if you also store doctorId as doc.id consistently everywhere.
      const doctorUid = doctor.uid || doctor.userId || doctor.id; // ensure your doctors have uid/userId saved

      if (!doctorUid) {
        alert(
          "Doctor UID is missing. Ensure doctor documents include uid/userId."
        );
        return;
      }

      await addDoc(collection(db, "consultations"), {
        doctorId: doctorUid,
        patientId: user.uid,
        patientName: user.displayName || "Anonymous",
        patientEmail: user.email || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert(`Request sent to ${doctor.displayName || "Doctor"}`);
    } catch (err) {
      console.error("Failed to send request:", err);
      alert("Failed to send request. Check console for details.");
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.displayName?.toLowerCase().includes(q) ||
      doc.phoneNumber?.includes(q) ||
      doc.degree?.toLowerCase().includes(q) ||
      doc.address?.toLowerCase().includes(q)
    );
  });

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

  return (
    <div className='w-full mt-auto justify-center items-center bg-white rounded-xl p-12 flex flex-col gap-4 '>
      <div className='w-3/4'>
        <input
          type='text'
          placeholder='Search by Name, Phone, Degree or Location...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
        />
      </div>

      {filteredDoctors.length === 0 && (
        <div className='text-center py-10'>
          <p className='text-gray-500 text-lg'>
            {search
              ? "No doctors found matching your search."
              : "No doctors available at the moment."}
          </p>
        </div>
      )}

      {filteredDoctors.map((doctor) => (
        <div
          key={doctor.id}
          className='w-3/4 bg-white rounded-xl shadow-md p-4 flex gap-4 items-start'
        >
          <Image
            src={doctor.photoURL || heroImage}
            alt={doctor.displayName || "Doctor"}
            width={64}
            height={64}
            className='w-16 h-16 rounded-lg object-cover'
          />

          <div className='flex-1'>
            <div className='flex items-center gap-1'>
              <h2 className='font-semibold text-lg'>
                {doctor.displayName || "Doctor"}
              </h2>
              {doctor.isVerified && (
                <Image
                  src={tick}
                  alt='verified'
                  width={16}
                  height={16}
                  className='w-4 h-4'
                />
              )}
            </div>

            {doctor.degree && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <Image src={degree} alt='degree' width={16} height={16} />
                <span>{doctor.degree}</span>
              </div>
            )}

            {doctor.address && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <Image src={location} alt='location' width={16} height={16} />
                <span>{doctor.address}</span>
              </div>
            )}

            {doctor.phoneNumber && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <Image src={phone} alt='phone' width={16} height={16} />
                <span>{doctor.phoneNumber}</span>
              </div>
            )}

            {doctor.age && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <span className='text-gray-500'>Age:</span>
                <span>{doctor.age} years</span>
              </div>
            )}

            {doctor.gender && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <span className='text-gray-500'>Gender:</span>
                <span className='capitalize'>{doctor.gender}</span>
              </div>
            )}

            {doctor.price && (
              <div className='flex items-center mt-3'>
                <div className='text-red-500 font-bold text-lg'>
                  Rs {doctor.price}/-
                </div>
              </div>
            )}

            <button
              onClick={() => sendRequest(doctor)}
              className='mt-3 w-full bg-[#FE5B63] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#e5525a] transition-colors'
            >
              Send Request
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
