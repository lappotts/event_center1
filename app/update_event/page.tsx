"use client";

import React, { useEffect, useState, Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function UpdateEventForm() {
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
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">No Event Found</h1>
        <p>Ensure the event ID is passed in the URL.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnapshot = await getDoc(eventRef);

        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          setFormData(eventData);
        } else {
          console.error("Event does not exist");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

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
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        ...formData,
        isApproved: false,
        updatedAt: new Date(),
      });

      router.push("/calendar");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Update Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        <div>
          <label htmlFor="eventName" className="block text-lg font-medium">
            Event Name
          </label>
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
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Update
        </button>
      </form>
    </div>
  );
}

export default function UpdateEvent() {
  return (
    <>
      <Header />
      <Suspense fallback={<p>Loading...</p>}>
        <UpdateEventForm />
      </Suspense>
      <Footer />
    </>
  );
}
