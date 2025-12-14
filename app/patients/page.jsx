"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../globals.css"
const auth = getAuth();

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wait for auth to be ready
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setDoctor(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!doctor) return;
      try {
        const q = query(
          collection(db, "consultations"),
          where("doctorId", "==", doctor.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(list);
      } catch (err) {
        console.error("Error loading requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [doctor]);

  if (!doctor) {
    return <div className="p-8">Please log in as a doctor.</div>;
  }

  if (loading) {
    return <div className="p-8">Loading your requests...</div>;
  }

  return (
    <div className="w-full p-12">
      <h1 className="text-xl font-bold mb-4">My Consultation Requests</h1>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        requests.map((req) => {
          const created =
            req.createdAt?.toDate?.() ||
            (typeof req.createdAt === "string" ? req.createdAt : null);

          return (
            <div key={req.id} className="p-4 border rounded-lg mb-4 bg-gray-50 shadow-sm">
              <h3 className="font-semibold">{req.patientName || "Unknown patient"}</h3>
              <p>Email: {req.patientEmail || "-"}</p>
              <p>Status: {req.status}</p>
              <p>Requested At: {created ? new Date(created).toLocaleString() : "—"}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
