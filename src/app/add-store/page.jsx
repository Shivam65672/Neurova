"use client";

import { useState } from "react";

export default function AddStorePage() {
  const [formData, setFormData] = useState({
    storeId: "",
    name: "",
    pincode: "",
    longitude: "",
    latitude: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/store/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: formData.storeId,
          name: formData.name,
          pincode: formData.pincode,
          location: {
            type: "Point",
            coordinates: [
              Number(formData.longitude),
              Number(formData.latitude),
            ],
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Store added successfully!");
        setFormData({
          storeId: "",
          name: "",
          pincode: "",
          longitude: "",
          latitude: "",
        });
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      setMessage("❌ Failed to add store");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-black">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg text-black">
        <h1 className="text-2xl font-semibold mb-4 text-center text-black">
          Add Store
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
          <div>
            <label className="block mb-1 font-medium text-black">Store ID</label>
            <input
              type="text"
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              className="border p-2 rounded w-full text-black placeholder:text-gray-600"
              placeholder="Enter store ID"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Store Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 rounded w-full text-black placeholder:text-gray-600"
              placeholder="Enter store name"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="border p-2 rounded w-full text-black placeholder:text-gray-600"
              placeholder="Enter store pincode"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Longitude</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="any"
              className="border p-2 rounded w-full text-black placeholder:text-gray-600"
              placeholder="Enter longitude"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-black">Latitude</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="any"
              className="border p-2 rounded w-full text-black placeholder:text-gray-600"
              placeholder="Enter latitude"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Add Store
          </button>
        </form>

        {message && <p className="mt-4 text-center text-black">{message}</p>}
      </div>
    </div>
  );
}