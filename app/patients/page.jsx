"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../globals.css";

const auth = getAuth();

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- AUTH ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setDoctor(u));
    return () => unsub();
  }, []);

  /* ---------- FETCH REQUESTS ---------- */
  useEffect(() => {
    const fetchRequests = async () => {
      if (!doctor) return;

      try {
        const q = query(
          collection(db, "consultations"),
          where("doctorId", "==", doctor.uid)
        );

        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setRequests(list);
      } catch (err) {
        console.error("Error loading requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [doctor]);

  /* ---------- TOGGLE APPROVAL ---------- */
  const toggleApproval = async (req) => {
    const newStatus = req.status === "approved" ? "pending" : "approved";

    try {
      await updateDoc(doc(db, "consultations", req.id), {
        status: newStatus,
        ...(newStatus === "approved"
          ? { approvedAt: serverTimestamp() }
          : { approvedAt: null }),
      });

      // Update UI instantly
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Failed to toggle approval:", err);
      alert("Failed to update request status.");
    }
  };

  /* ---------- GUARDS ---------- */
  if (!doctor) {
    return <div className='p-8'>Please log in as a doctor.</div>;
  }

  if (loading) {
    return <div className='p-8'>Loading your requests...</div>;
  }

  /* ---------- UI ---------- */
  return (
    <div className='w-full p-12'>
      <h1 className='text-xl font-bold mb-4'>My Consultation Requests</h1>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        requests.map((req) => {
          const created =
            req.createdAt?.toDate?.() ||
            (typeof req.createdAt === "string" ? req.createdAt : null);

          const isApproved = req.status === "approved";

          return (
            <div
              key={req.id}
              className='p-4 border rounded-lg mb-4 bg-gray-50 shadow-sm flex justify-between items-center'
            >
              <div>
                <h3 className='font-semibold'>
                  {req.patientName || "Unknown patient"}
                </h3>
                <p>Email: {req.patientEmail || "-"}</p>
                <p>Phone: {req.patientPhone || "-"}</p>
                <p>Status: {req.status}</p>
                <p>
                  Requested At:{" "}
                  {created ? new Date(created).toLocaleString() : "—"}
                </p>
              </div>

              {/* ACTION */}
              {(req.status === "pending" || req.status === "approved") && (
                <button
                  onClick={() => toggleApproval(req)}
                  className={`text-xl font-bold border-2 rounded-2xl p-1 transition hover:scale-110 ${
                    isApproved
                      ? "text-green-600  border-green-500  "
                      : "text-gray-400 border-red-500 "
                  }`}
                  title={
                    isApproved ? "Click to revert approval" : "Approve request"
                  }
                >
                  ✓
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
