"use client";
import { useState, useEffect } from "react";
import "../globals.css";
import Image from "next/image";
import { db } from "../../lib/firebase";
import { collection, getDocs,  query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const auth = getAuth();
console.log(auth.currentUser);
// Assets
import heroImage from "../../assets/heroimage.png";
import degree from "../../assets/degree.svg";
import location from "../../assets/location.svg";
import phone from "../../assets/phone.svg";
import tick from "../../assets/tick.svg";

export default function Page() {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collection reference - following movie app pattern
  const usersCollectionRef = collection(db, "users");

  // Get doctor list - following getMovieList pattern
  const getDoctorList = async () => {
    try {
      const q = query(usersCollectionRef, where("role", "==", "doctor"));
      const data = await getDocs(q);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setDoctors(filteredData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors on mount - following movie app pattern
  useEffect(() => {
    getDoctorList();
  }, []);

  // Filter doctors by search input
  const filteredDoctors = doctors.filter((doc) => {
    const searchQuery = search.toLowerCase();
    return (
      doc.displayName?.toLowerCase().includes(searchQuery) ||
      doc.phoneNumber?.includes(searchQuery) ||
      doc.degree?.toLowerCase().includes(searchQuery) ||
      doc.address?.toLowerCase().includes(searchQuery)
    );
  });

  // Loading state
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

  // Main render
  return (
    <div className='w-full mt-auto h-full justify-center items-center bg-white rounded-xl p-12 flex flex-col gap-4'>
      {/* Search bar */}
      <div className='w-3/4'>
        <input
          type='text'
          placeholder='Search by Name, Phone, Degree or Location...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
        />
      </div>

      {/* Empty state */}
      {filteredDoctors.length === 0 && (
        <div className='text-center py-10'>
          <p className='text-gray-500 text-lg'>
            {search
              ? "No doctors found matching your search."
              : "No doctors available at the moment."}
          </p>
        </div>
      )}

      {/* Doctor cards */}
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
            className='w-16 h-16 rounded-lg object-cover bg-gray-200'
          />

          <div className='flex-1'>
            {/* Name + Verified */}
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

            {/* Degree */}
            {doctor.degree && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <Image src={degree} alt='degree' width={16} height={16} />
                <span>{doctor.degree}</span>
              </div>
            )}

            {/* Address */}
            {doctor.address && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <Image src={location} alt='location' width={16} height={16} />
                <span>{doctor.address}</span>
              </div>
            )}

            {/* Phone */}
            {doctor.phoneNumber && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <Image src={phone} alt='phone' width={16} height={16} />
                <span>{doctor.phoneNumber}</span>
              </div>
            )}

            {/* Age */}
            {doctor.age && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <span className='text-gray-500'>Age:</span>
                <span>{doctor.age} years</span>
              </div>
            )}

            {/* Gender */}
            {doctor.gender && (
              <div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
                <span className='text-gray-500'>Gender:</span>
                <span className='capitalize'>{doctor.gender}</span>
              </div>
            )}

            {/* Price */}
            {doctor.price && (
              <div className='flex items-center mt-3'>
                <div className='text-red-500 font-bold text-lg'>
                  Rs {doctor.price}/-
                </div>
              </div>
            )}

            {/* Action button */}
            <button className='mt-3 w-full bg-[#FE5B63] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#e5525a] transition-colors'>
              Send Request
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
