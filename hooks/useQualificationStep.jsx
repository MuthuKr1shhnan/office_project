"use client"
import { useState } from "react";

export function useQualificationStep() {
  const [openSection, setOpenSection] = useState("graduation");

  const [qualification, setQualification] = useState({
    mbbsRegNo: "",
    mbbsCouncil: "",
    mbbsYear: "",
    speciality: "",
    superSpeciality: "",
  });

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQualification((prev) => ({ ...prev, [name]: value }));
  };

  return {
    openSection,
    toggleSection,
    qualification,
    handleChange,
  };
}
