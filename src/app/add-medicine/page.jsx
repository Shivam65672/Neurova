"use client";
import { useState } from "react";

export default function AddMedicinePage() {
  const [formData, setFormData] = useState({
    medicineId: "",
    name: "",
    category: "",
    defaultCost: "",
    stores: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/medicine/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          defaultCost: Number(formData.defaultCost),
          stores: JSON.parse(formData.stores),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Medicine added successfully!");
        setFormData({
          medicineId: "",
          name: "",
          category: "",
          defaultCost: "",
          stores: "",
        });
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      setMessage("❌ Failed to add medicine");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-black">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg text-black">
        <h1 className="text-2xl font-semibold mb-4 text-center text-black">
          Add Medicine
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
          <input
            type="text"
            name="medicineId"
            placeholder="Medicine ID"
            value={formData.medicineId}
            onChange={handleChange}
            className="border p-2 rounded text-black placeholder:text-gray-600"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded text-black placeholder:text-gray-600"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border p-2 rounded text-black placeholder:text-gray-600"
            required
          />
          <input
            type="number"
            name="defaultCost"
            placeholder="Default Cost"
            value={formData.defaultCost}
            onChange={handleChange}
            className="border p-2 rounded text-black placeholder:text-gray-600"
            required
          />
          <textarea
            name="stores"
            placeholder='Stores JSON array (e.g. [{"storeId":"S001","available":true,"cost":35}] )'
            value={formData.stores}
            onChange={handleChange}
            className="border p-2 rounded h-32 text-black placeholder:text-gray-600"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          >
            Add Medicine
          </button>
        </form>
        {message && <p className="mt-4 text-center text-black">{message}</p>}
      </div>
    </div>
  );
}
