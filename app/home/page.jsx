"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Btn from "../../component/Btn";
import { db, auth } from "../../lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CureboonDashboard() {
  const router = useRouter();

  const [uid, setUid] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [activeTab, setActiveTab] = useState("ALL");

  const [searchName, setSearchName] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState(
    "Search by Speciality"
  );
  const [showSpecialityDropdown, setShowSpecialityDropdown] = useState(false);

  const specialities = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "General Medicine",
  ];

  /* -------------------- AUTH -------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsub();
  }, []);

  /* -------------------- FETCH ALL DOCTORS -------------------- */
  useEffect(() => {
    if (!uid) return;

    const fetchDoctors = async () => {
      const snap = await getDocs(collection(db, "users"));

      const list = snap.docs.map((docSnap) => {
        const d = docSnap.data();

        return {
          id: docSnap.id,
          name: d?.name || "",
          city: d?.city || "",
          address: d?.address || "",
          speciality:
            typeof d?.speciality === "string"
              ? d.speciality
              : d?.speciality?.subject || "",
          supSpeciality: d?.superSpeciality?.subject || "",
          fees: d?.step5?.consultationFee || "",
        };
      });

      setDoctors(list);
    };

    fetchDoctors();
  }, [uid]);

  /* -------------------- FETCH RECENT DOCTORS -------------------- */
  useEffect(() => {
    if (!uid || doctors.length === 0) return;

    const fetchRecent = async () => {
      const snap = await getDoc(doc(db, "userSessions", uid));
      if (!snap.exists()) {
        setRecentDoctors([]);
        return;
      }

      const data = snap.data();

      const ordered = (data.recentDoctors || [])
        .sort((a, b) => b.viewedAt - a.viewedAt)
        .map((r) => doctors.find((d) => d.id === r.doctorId))
        .filter(Boolean);

      setRecentDoctors(ordered);
    };

    fetchRecent();
  }, [uid, doctors]);

  /* -------------------- VIEW PROFILE -------------------- */
  const handleViewProfile = async (doctorId) => {
    if (!uid) return;

    const ref = doc(db, "userSessions", uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    const existing = Array.isArray(data.recentDoctors)
      ? data.recentDoctors.filter((d) => d.doctorId !== doctorId)
      : [];

    const updated = [{ doctorId, viewedAt: Date.now() }, ...existing].slice(
      0,
      10
    );

    await setDoc(
      ref,
      {
        selectedDoctorId: doctorId,
        recentDoctors: updated,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    router.push("/home/profile");
  };

  /* -------------------- FILTER LOGIC -------------------- */
  useEffect(() => {
    const base = activeTab === "ALL" ? doctors : recentDoctors;
    let result = [...base];

    if (searchName.trim()) {
      const v = searchName.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(v) || d.id.toLowerCase().includes(v)
      );
    }

    if (searchCity.trim()) {
      const v = searchCity.toLowerCase();
      result = result.filter((d) => d.city.toLowerCase().includes(v));
    }

    if (selectedSpeciality !== "Search by Speciality") {
      result = result.filter((d) => d.speciality === selectedSpeciality);
    }

    setFilteredDoctors(result);
  }, [
    searchName,
    searchCity,
    selectedSpeciality,
    doctors,
    recentDoctors,
    activeTab,
  ]);

  /* -------------------- UI -------------------- */
  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
      {" "}
      {/* ALERTS */}{" "}
      <div className='max-w-7xl mx-auto mb-4 space-y-3'>
        {" "}
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          {" "}
          <p className='text-sm text-yellow-800'>
            {" "}
            Your account will be functional once registration details are
            verified by Cureboon{" "}
          </p>{" "}
        </div>{" "}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          {" "}
          <p className='text-sm text-blue-800'>
            {" "}
            You can send / receive request only on uploading registration number
            in your profile.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* MAIN CONTENT */}{" "}
      <div className='max-w-7xl mx-auto'>
        {" "}
        {/* HEADER */}{" "}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          {" "}
          <div className='flex items-center gap-3'>
            {" "}
            <div className='w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded flex items-center justify-center'>
              {" "}
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                {" "}
                <rect x='9' y='9' width='13' height='13' rx='2' ry='2' />{" "}
                <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />{" "}
              </svg>{" "}
            </div>{" "}
            <span className='text-xl font-semibold text-gray-800'>Home</span>{" "}
          </div>{" "}
          <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
            {" "}
            <Btn className='px-6 py-2.5 w-full sm:w-auto'>
              {" "}
              + Add New Patient{" "}
            </Btn>{" "}
            <Btn className='px-6 py-2.5 w-full sm:w-auto'>
              {" "}
              + Add Emergency Case{" "}
            </Btn>{" "}
          </div>{" "}
        </div>{" "}
        {/* TABS */}{" "}
        <div className='bg-white rounded-t-lg border-b'>
          {" "}
          <div className='flex flex-col sm:flex-row gap-2 p-1'>
            {" "}
            <Btn
              variant={activeTab === "RECENT" ? "primary" : "sec"}
              className='px-8 py-3 font-medium w-full sm:w-auto'
              onClick={() => setActiveTab("RECENT")}
            >
              {" "}
              Recently Viewed ({recentDoctors.length}){" "}
            </Btn>{" "}
            <Btn
              variant={activeTab === "ALL" ? "primary" : "sec"}
              className='px-8 py-3 font-medium w-full sm:w-auto'
              onClick={() => {
                setActiveTab("ALL");
                setSearchName("");
                setSearchCity("");
                setSelectedSpeciality("Search by Speciality");
              }}
            >
              {" "}
              All doctors{" "}
            </Btn>{" "}
          </div>{" "}
        </div>{" "}
        {/* SEARCH SECTION */}{" "}
        <div className='bg-white rounded-b-lg shadow-sm p-4 sm:p-6 lg:p-8'>
          {" "}
          <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
            {" "}
            Find a Doctor you need{" "}
          </h2>{" "}
          <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4'>
            {" "}
            {/* Search Name */}{" "}
            <div className='relative'>
              {" "}
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />{" "}
              <input
                type='text'
                placeholder='Search by Name/ID'
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500'
              />{" "}
            </div>{" "}
            {/* Speciality */}{" "}
            <div className='relative'>
              {" "}
              <button
                onClick={() =>
                  setShowSpecialityDropdown(!showSpecialityDropdown)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-indigo-500'
              >
                {" "}
                <span
                  className={
                    selectedSpeciality === "Search by Speciality"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }
                >
                  {" "}
                  {selectedSpeciality}{" "}
                </span>{" "}
                <svg
                  className='w-5 h-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  {" "}
                  <path d='M19 9l-7 7-7-7' />{" "}
                </svg>{" "}
              </button>{" "}
              {showSpecialityDropdown && (
                <div className='absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto'>
                  {" "}
                  {specialities.map((spec, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSpeciality(spec);
                        setShowSpecialityDropdown(false);
                      }}
                      className='w-full px-4 py-2 text-left hover:bg-gray-100'
                    >
                      {" "}
                      {spec}{" "}
                    </button>
                  ))}{" "}
                </div>
              )}{" "}
            </div>{" "}
            {/* City */}{" "}
            <div className='relative'>
              {" "}
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />{" "}
              <input
                type='text'
                placeholder='Search by City'
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500'
              />{" "}
            </div>{" "}
            {/* Search Button */}{" "}
            <Btn className='px-10 py-3 w-full lg:w-auto'>Search</Btn>{" "}
          </div>{" "}
        </div>{" "}
        {/* RESULTS */}{" "}
        <div className='mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-8 lg:p-12'>
          {" "}
          {filteredDoctors.length === 0 ? (
            <div className='text-center text-gray-500 text-lg'>
              {" "}
              No doctor in your search list{" "}
            </div>
          ) : (
            <div className='grid gap-6'>
              {" "}
              {filteredDoctors.map((doc, idx) => (
                <div
                  className='border rounded-lg p-4 sm:p-6 bg-white shadow-sm'
                  key={idx}
                >
                  {" "}
                  {/* TOP */}{" "}
                  <div className='flex flex-col lg:flex-row lg:justify-between gap-6'>
                    {" "}
                    {/* Left Section */}{" "}
                    <div className='flex gap-4 items-center'>
                      {" "}
                      <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg'>
                        {" "}
                        {doc.name.charAt(0)}{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <h3 className='text-base sm:text-lg font-semibold text-pink-500'>
                          {" "}
                          {doc.name}{" "}
                        </h3>{" "}
                        <p className='text-xs sm:text-sm text-gray-500'>
                          {" "}
                          ID - {doc.id}{" "}
                        </p>{" "}
                        <span className='inline-block mt-1 w-3 h-3 rounded-full bg-green-500' />{" "}
                      </div>{" "}
                    </div>{" "}
                    {/* Right Section */}{" "}
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs sm:text-sm'>
                      {" "}
                      <div>
                        {" "}
                        <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                          {" "}
                          Speciality{" "}
                        </p>{" "}
                        <p className='font-medium'>{doc.speciality}</p>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                          {" "}
                          Super Speciality{" "}
                        </p>{" "}
                        <p className='font-medium'>{doc.supSpeciality}</p>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                          {" "}
                          Patients Consulted{" "}
                        </p>{" "}
                        <p className='font-medium'>{doc.patients || 0}</p>{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                          {" "}
                          Followup Patients{" "}
                        </p>{" "}
                        <p className='font-medium'>{doc.followups || 0}</p>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <hr className='my-6' /> {/* BOTTOM */}{" "}
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 text-xs sm:text-sm'>
                    {" "}
                    <div>
                      {" "}
                      <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                        {" "}
                        Clinic Address{" "}
                      </p>{" "}
                      <p className='font-medium'>
                        {" "}
                        {doc.clinic} {doc.address}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                        {" "}
                        Consultation Fees{" "}
                      </p>{" "}
                      <p className='font-medium'>{doc.fees}</p>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                        {" "}
                        Experience{" "}
                      </p>{" "}
                      <p className='font-medium'>{doc.experience} Years</p>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className='text-[10px] sm:text-xs text-gray-400 uppercase'>
                        {" "}
                        Status{" "}
                      </p>{" "}
                      <p className='flex items-center gap-2 text-green-600 font-medium'>
                        {" "}
                        <span className='w-2 h-2 bg-green-500 rounded-full' />{" "}
                        Online{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* ACTIONS */}{" "}
                  <div className='mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4'>
                    {" "}
                    <button
                      onClick={() => handleViewProfile(doc.id)}
                      className='px-4 sm:px-6 py-2 bg-gray-100 rounded-md text-xs sm:text-sm'
                    >
                      {" "}
                      View Profile{" "}
                    </button>{" "}
                    <button
                      disabled
                      className='px-4 sm:px-6 py-2 bg-gray-200 text-gray-400 rounded-md text-xs sm:text-sm w-full sm:w-auto cursor-not-allowed'
                    >
                      {" "}
                      Send Request{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* NEW REQUESTS */}{" "}
        <div className='mt-6 bg-white rounded-lg shadow-sm'>
          {" "}
          <button className='w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50'>
            {" "}
            <span className='text-lg font-medium text-gray-800'>
              {" "}
              New Requests (0){" "}
            </span>{" "}
            <svg
              className='w-5 h-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {" "}
              <path d='M19 9l-7 7-7-7' />{" "}
            </svg>{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
