// schedule_event/page.tsx
"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext"; // Adjust path as needed
import { db } from "@/config/firebase.config";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ScheduleEvent() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    start: "",
    details: "",
    buildingName: "",
    roomNumber: "",
  });

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.uid) {
      console.error("User not logged in");
      return;
    }
  
    try {
      // Add event to Firestore "events" collection
      const eventRef = await addDoc(collection(db, "events"), {
        ...formData,
        createdBy: user.uid, // Track which user created the event
        timestamp: new Date(),
        isApproved: false,
      });
  
      // Add the new event ID to the user's `eventIds` array
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        eventIds: [...(user.eventIds || []), eventRef.id],
      });
  
      console.log("Event Scheduled:", formData);
      router.push('/');
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Schedule an Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-lg font-medium">Event Name</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-lg font-medium">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]} // Sets min to tomorrow's date
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-lg font-medium">Time</label>
            <input
              type="time"
              id="start"
              name="start"
              value={formData.start}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="buildingName" className="block text-lg font-medium">Building Name</label>
            <input
              type="text"
              id="buildingName"
              name="buildingName"
              value={formData.buildingName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="roomNumber" className="block text-lg font-medium">Room Number</label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="details" className="block text-lg font-medium">Event Details</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}