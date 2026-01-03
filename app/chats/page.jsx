"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import Btn from "@/component/Btn";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function PatientChat() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineDoctors, setOnlineDoctors] = useState(new Set());
  const bottomRef = useRef(null);

  /* AUTH */
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists() && snap.data().role === "patient") {
        setUser(u);
      }
    });
  }, []);

  /* LOAD APPROVED DOCTORS */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const q = query(
        collection(db, "consultations"),
        where("patientId", "==", user.uid),
        where("status", "==", "approved")
      );

      const snap = await getDocs(q);
      const list = [];

      for (const d of snap.docs) {
        const data = d.data();
        const doctorSnap = await getDoc(doc(db, "users", data.doctorId));

        list.push({
          roomId: d.id,
          doctorId: data.doctorId,
          doctor: doctorSnap.data(),
        });
      }

      setDoctors(list);
    };

    load();
  }, [user]);

  /* MONITOR ONLINE STATUS */
  useEffect(() => {
    if (!user || doctors.length === 0) return;
    const doctorIds = doctors.map((d) => d.doctorId);
    const unsubscribes = doctorIds.map((did) => {
      return onSnapshot(doc(db, "users", did), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setOnlineDoctors((prev) => {
            const updated = new Set(prev);
            if (data.online) {
              updated.add(did);
            } else {
              updated.delete(did);
            }
            return updated;
          });
        }
      });
    });
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [user, doctors]);

  /* JOIN ROOM + LOAD HISTORY */
  useEffect(() => {
    if (!room || !user) return;
    loadHistory(room);
  }, [room]);

  /* LOAD MESSAGE HISTORY */
  const loadHistory = async (roomId) => {
    const q = query(collection(db, "messages"), where("roomId", "==", roomId));

    const snap = await getDocs(q);
    const history = snap.docs
      .map((d) => d.data())
      .sort((a, b) => a.createdAt - b.createdAt);

    setMessages(history);
  };

  /* GROUP MESSAGES BY DATE */
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const isToday = (date) => {
    const today = new Date();
    const msgDate = new Date(date);
    return (
      msgDate.getDate() === today.getDate() &&
      msgDate.getMonth() === today.getMonth() &&
      msgDate.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(date);
    return (
      msgDate.getDate() === yesterday.getDate() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getFullYear() === yesterday.getFullYear()
    );
  };

  const formatDateLabel = (dateKey) => {
    const firstMsg = groupedMessages[dateKey][0];
    if (isToday(firstMsg.createdAt)) return "Today";
    if (isYesterday(firstMsg.createdAt)) return "Yesterday";
    return dateKey;
  };

  const groupedMessages = groupMessagesByDate(messages);

  /* SEND MESSAGE */
  const sendMessage = async () => {
    if (!input.trim() || !room || !user) return;

    const msg = {
      roomId: room,
      senderId: user.uid,
      senderRole: "patient",
      text: input,
      createdAt: Date.now(),
    };

    await addDoc(collection(db, "messages"), msg);

    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className='flex h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      <div className='w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg'>
        <h2 className='text-2xl font-bold text-white p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600'>
          Doctors
        </h2>

        <div className='flex-1 overflow-y-auto'>
          {doctors.map((d) => {
            const isOnline = onlineDoctors.has(d.doctorId);
            const isSelected = room === d.roomId;
            return (
              <button
                key={d.roomId}
                onClick={() => setRoom(d.roomId)}
                className={`w-full text-left p-4 border-b border-slate-100 transition-all duration-200 hover:bg-indigo-50 ${
                  isSelected
                    ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                    : ""
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-md'>
                      {d.doctor.displayName?.charAt(0).toUpperCase() || "D"}
                    </div>
                    
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-slate-800 truncate'>
                      {d.doctor.displayName}
                    </p>
                   
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <main className='flex flex-col flex-1'>
        <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50'>
          {Object.keys(groupedMessages).map((dateKey) => (
            <div key={dateKey} className='space-y-4'>
              <div className='flex items-center justify-center my-4'>
                <div className='bg-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full'>
                  {formatDateLabel(dateKey)}
                </div>
              </div>
              {groupedMessages[dateKey].map((m, i) => {
                const isPatient = m.senderRole === "patient";
                return (
                  <div
                    key={i}
                    className={`flex ${
                      isPatient ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        isPatient
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white text-slate-800 rounded-bl-sm border border-slate-200"
                      }`}
                    >
                      <p className='text-sm leading-relaxed'>{m.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isPatient ? "text-indigo-100" : "text-slate-400"
                        }`}
                      >
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className='bg-white border-t border-slate-200 p-4 shadow-lg'>
          <div className='flex gap-3 items-end max-w-4xl mx-auto'>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className='flex-1 border border-slate-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
              placeholder='Type your message...'
            />
            <Btn
              onClick={sendMessage}
              className='bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!input.trim()}
            >
              Send
            </Btn>
          </div>
        </div>
      </main>
    </div>
  );
}
