// No API used, directly medicine image sent from here to OCR api(link)

"use client";

import React, { useState } from "react";
import Image from "next/image";
import UserNav from "@/components/UserNav";
import UserFooter from "@/components/UserFooter";

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_OCR_API_URL;
  //console.log(API_URL);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);
    setError("");
    setResult(null);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  async function uploadImage(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${API_URL}/extract-text`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await uploadImage(selectedFile);
      setResult(data);
      if (data?.medicines) {
        const langs = Object.keys(data.medicines);
        setLanguage(
          langs.includes(language.toLowerCase())
            ? language.toLowerCase()
            : langs[0]
        );
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black pt-8 pb-16">
        {/* Header Section */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Medicine OCR Scanner
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Upload an image of your medicine prescription to extract detailed information
              using advanced OCR technology
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Upload Section */}
            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Upload Medicine Image
                </h2>
              </div>

              <div className="flex flex-col items-center space-y-6">
                {previewUrl ? (
                  <div className="w-full">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 to-teal-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                      <div className="relative p-6 border-2 border-cyan-500/50 rounded-xl bg-zinc-900 shadow-2xl">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={400}
                          height={400}
                          className="rounded-lg object-contain max-h-96 w-full"
                        />
                        <button
                          onClick={() => {
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setResult(null);
                          }}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="ocr-file-input"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full p-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${
                      isDragging
                        ? 'border-cyan-400 bg-linear-to-brrom-cyan-500/20 to-teal-600/20 scale-[1.02] shadow-lg shadow-cyan-500/20'
                        : 'border-zinc-700 bg-linear-to-br from-zinc-800/50 to-zinc-800/30 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10'
                    }`}
                    tabIndex={0}
                  >
                    <div className={`w-20 h-20 rounded-full bg-linear-to-br from-cyan-500/20 to-teal-600/20 flex items-center justify-center mb-6 transition-all duration-300 ${
                      isDragging ? 'scale-110 shadow-lg shadow-cyan-500/30' : 'group-hover:scale-105'
                    }`}>
                      <svg
                        className={`w-10 h-10 transition-all duration-300 ${
                          isDragging ? 'text-cyan-300 scale-110' : 'text-cyan-400 group-hover:text-cyan-300'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className={`text-center font-bold text-xl mb-2 transition-colors ${
                      isDragging ? 'text-cyan-300' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {isDragging ? 'Drop your image here!' : 'Drop your medicine image here'}
                    </p>
                    <p className="text-zinc-400 text-sm mb-3">or click to browse from your device</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Supports JPG, PNG, WEBP files</span>
                    </div>
                  </label>
                )}

                <div className="w-full space-y-5">
                  <input
                    id="ocr-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {error && (
                    <div className="w-full rounded-lg bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <label htmlFor="lang" className="text-white font-semibold">
                        Select Language
                      </label>
                    </div>
                    <select
                      id="lang"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-zinc-600 rounded-lg px-4 py-3 text-white font-medium bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer hover:border-cyan-500/50"
                    >
                      <option value="EN">🇬🇧 English</option>
                      <option value="HI">🇮🇳 Hindi (हिंदी)</option>
                      <option value="TA">🇮🇳 Tamil (தமிழ்)</option>
                      <option value="BN">🇮🇳 Bengali (বাংলা)</option>
                      <option value="GU">🇮🇳 Gujarati (ગુજરાતી)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                    className="relative w-full group overflow-hidden bg-linear-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-base"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg
                          className="animate-spin h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Extracting Information...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Extract Medicine Data</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Extraction Results
                </h2>
              </div>

              {result && result.medicines && result.medicines[language] ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {result.medicines[language].map((med, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-zinc-800 bg-linear-to-br from-black/50 to-zinc-900/50 p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div className="rounded-lg bg-linear-to-br from-cyan-500/10 to-cyan-600/5 p-5 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                              Medicine Name
                            </h3>
                          </div>
                          <p className="text-lg font-bold text-white leading-tight">
                            {med.medicine_name?.trim() || "Not enough data"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-linear-to-br from-teal-500/10 to-teal-600/5 p-5 border border-teal-500/30 hover:border-teal-500/50 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                              Dosage
                            </h3>
                          </div>
                          <p className="text-lg font-bold text-white leading-tight">
                            {med.dosage?.trim() || "Not enough data"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-linear-to-br from-purple-500/10 to-purple-600/5 p-5 border border-purple-500/30 hover:border-purple-500/50 transition-colors mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                            Usage Instructions
                          </h3>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {med.usage_instructions?.trim() || "Not enough data"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-linear-to-br from-green-500/10 to-green-600/5 p-5 border border-green-500/30 hover:border-green-500/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider">
                            Medicine Use
                          </h3>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {med.medicine_use?.trim() || "Not enough data"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-800/50 mb-6 border border-zinc-700">
                    <svg
                      className="w-12 h-12 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold text-zinc-400 mb-2">
                    No results yet
                  </p>
                  <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                    Upload a medicine image and click extract to see detailed information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm p-10 shadow-xl">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white mb-2">
                Why Use Our OCR Scanner?
              </h3>
              <p className="text-zinc-400">Advanced technology for accurate medicine information extraction</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-cyan-500/20 to-teal-600/20 border border-cyan-500/30 mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                  <div className="absolute inset-0 bg-linear-to-br from-cyan-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <svg
                    className="w-9 h-9 text-cyan-400 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  Fast Processing
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Extract medicine information in seconds using advanced OCR
                  technology powered by AI
                </p>
              </div>
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-teal-500/20 to-green-600/20 border border-teal-500/30 mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300">
                  <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <svg
                    className="w-9 h-9 text-teal-400 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                  Multi-language Support
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Supports multiple Indian languages for better accessibility
                  and convenience
                </p>
              </div>
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                  <div className="absolute inset-0 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <svg
                    className="w-9 h-9 text-green-400 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                  Accurate Results
                </h4>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  High accuracy medicine information extraction with detailed
                  analysis and verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </>
  );
}
