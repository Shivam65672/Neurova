'use client';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useState } from 'react';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';
import { usePatientProfile } from '@/hooks/usePatientProfile';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MedicalHistory() {
  const { user } = useUser();
  const { profile, loading } = usePatientProfile();
  const [activeTab, setActiveTab] = useState('conditions');

  const [medicalHistory, setMedicalHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);

  const [conditionForm, setConditionForm] = useState({
    condition: "",
    diagnosedDate: "",
    status: "Active",
    severity: "Mild",
  });

  const [allergyForm, setAllergyForm] = useState({
    allergen: "",
    reaction: "",
    diagnosedDate: "",
    status: "Active",
    severity: "Mild",
  });

  const [surgeryForm, setSurgeryForm] = useState({
    procedure: "",
    hospital: "",
    date: "",
    notes: "",
  });

  const [familyForm, setFamilyForm] = useState({
    relation: "",
    condition: "",
    ageOfOnset: "",
  });

  const [labForm, setLabForm] = useState({
    test: "",
    result: "",
    normalRange: "",
    date: "",
    status: "Normal",
  });

  const downloadMedicalRecord = () => {
    const doc = new jsPDF();

    // =====================
    // Header
    // =====================

    doc.setDrawColor(150);
    doc.line(15, 15, 195, 15);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0);

    doc.text("NEUROVA", 105, 24, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(90);

    doc.text(
      "Digital Healthcare Platform",
      105,
      31,
      {
        align: "center",
      }
    );

    doc.line(15, 37, 195, 37);

    // =====================
    // Patient Information
    // =====================

    doc.setDrawColor(60);
    doc.setLineWidth(1.3);
    doc.rect(15, 44, 180, 36);

    doc.setLineWidth(0.2);
    doc.setFontSize(11);

    // -------- First Row --------
    doc.setFont("helvetica", "bold");
    doc.text("Name :", 20, 54);
    doc.setFont("helvetica", "normal");
    doc.text(`${profile?.name || "N/A"}`, 38, 54);

    doc.setFont("helvetica", "bold");
    doc.text("Age :", 110, 54);
    doc.setFont("helvetica", "normal");
    doc.text(`${profile?.age || "N/A"} Years`, 126, 54);

    // -------- Second Row --------
    doc.setFont("helvetica", "bold");
    doc.text("Gender :", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`${profile?.gender || "N/A"}`, 45, 65);

    doc.setFont("helvetica", "bold");
    doc.text("Height :", 110, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`${profile?.height || "N/A"} cm`, 131, 65);

    // -------- Third Row --------
    doc.setFont("helvetica", "bold");
    doc.text("Weight :", 20, 76);
    doc.setFont("helvetica", "normal");
    doc.text(`${profile?.weight || "N/A"} kg`, 44, 76);

    doc.setFont("helvetica", "bold");
    doc.text("Generated :", 110, 76);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date().toLocaleDateString()}`, 137, 76);

    let y = 94;

    // =====================
    // Conditions
    // =====================

    doc.setFontSize(15);
    doc.text("Medical Conditions", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Condition", "Date", "Status", "Severity"]],
      body:
        medicalHistory?.medicalConditions?.map((item) => [
          item.condition,
          formatDate(item.diagnosedDate),
          item.status,
          item.severity,
        ]) || [],
      theme: "grid",
      headStyles: {
        fillColor: [80, 80, 80], // elegant dark grey
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // =====================
    // Allergies
    // =====================

    doc.setFontSize(15);
    doc.text("Allergies", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Allergen", "Reaction", "Status", "Severity"]],
      body:
        medicalHistory?.allergies?.map((item) => [
          item.allergen,
          item.reaction,
          item.status,
          item.severity,
        ]) || [],
      theme: "grid",
      headStyles: {
        fillColor: [80, 80, 80], // elegant dark grey
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // =====================
    // Surgeries
    // =====================

    doc.setFontSize(15);
    doc.text("Past Surgeries", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Procedure", "Hospital", "Date", "Notes"]],
      body:
        medicalHistory?.surgeries?.map((item) => [
          item.procedure,
          item.hospital,
          formatDate(item.date),
          item.notes,
        ]) || [],
      theme: "grid",
      headStyles: {
        fillColor: [80, 80, 80], // elegant dark grey
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // =====================
    // Family History
    // =====================

    doc.setFontSize(15);
    doc.text("Family History", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Relation", "Condition", "Age Of Onset"]],
      body:
        medicalHistory?.familyHistory?.map((item) => [
          item.relation,
          item.condition,
          item.ageOfOnset,
        ]) || [],
      theme: "grid",
      headStyles: {
        fillColor: [80, 80, 80], // elegant dark grey
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    y = doc.lastAutoTable.finalY + 12;

    // =====================
    // Lab Results
    // =====================

    doc.setFontSize(15);
    doc.text("Lab Results", 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Test", "Result", "Range", "Date", "Status"]],
      body:
        medicalHistory?.labResults?.map((item) => [
          item.test,
          item.result,
          item.normalRange,
          formatDate(item.date),
          item.status,
        ]) || [],
      theme: "grid",
      headStyles: {
        fillColor: [80, 80, 80], // elegant dark grey
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    // =====================
    // Footer
    // =====================

    const pageHeight = doc.internal.pageSize.height;

    doc.setDrawColor(180);
    doc.line(15, pageHeight - 24, 195, pageHeight - 24);

    doc.setFontSize(9);
    doc.setTextColor(100);

    doc.text(
      "Generated by NEUROVA Digital Healthcare Platform",
      105,
      pageHeight - 17,
      {
        align: "center",
      }
    );

    doc.text(
      "This report is computer generated and intended for medical reference only.",
      105,
      pageHeight - 12,
      {
        align: "center",
      }
    );

    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      105,
      pageHeight - 7,
      {
        align: "center",
      }
    );

    doc.save(
      `${profile?.name || "Patient"}_Medical_Record.pdf`
    );
  };

  const fetchMedicalHistory = async () => {
    if (!user?.id) return;

    try {
      setHistoryLoading(true);

      const res = await fetch(
        `/api/medical-history?clerkId=${user.id}`
      );

      const data = await res.json();

      if (data.success) {
        setMedicalHistory(data.history);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'mild':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'controlled':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'normal':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'elevated':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const tabs = [
    { id: 'conditions', name: 'Medical Conditions', icon: '🏥' },
    { id: 'allergies', name: 'Allergies', icon: '⚠️' },
    { id: 'surgeries', name: 'Surgeries', icon: '🔬' },
    { id: 'family', name: 'Family History', icon: '👨‍👩‍👧‍👦' },
    { id: 'labs', name: 'Lab Results', icon: '📋' },
  ];

  const handleAddCondition = async () => {
    console.log("Sending:", conditionForm);

    try {
      const res = await fetch("/api/medical-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          type: "condition",
          ...conditionForm,
        }),
      });

      console.log("Status:", res.status);

      const data = await res.json();
      console.log("Response:", data);

      if (data.success) {
        setShowConditionModal(false);

        setConditionForm({
          condition: "",
          diagnosedDate: "",
          status: "Active",
          severity: "Mild",
        });

        fetchMedicalHistory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddAllergy = async () => {
    try {
      const res = await fetch("/api/medical-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          type: "allergy",
          ...allergyForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowAllergyModal(false);

        setAllergyForm({
          allergen: "",
          reaction: "",
          severity: "Mild",
          status: "Active",
          diagnosedDate: "",
        });

        fetchMedicalHistory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddSurgery = async () => {
    try {
      const res = await fetch("/api/medical-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          type: "surgery",
          ...surgeryForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowSurgeryModal(false);

        setSurgeryForm({
          procedure: "",
          hospital: "",
          date: "",
          notes: "",
        });

        fetchMedicalHistory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddFamily = async () => {
    try {
      const res = await fetch("/api/medical-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          type: "family",
          ...familyForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowFamilyModal(false);

        setFamilyForm({
          relation: "",
          condition: "",
          ageOfOnset: "",
        });

        fetchMedicalHistory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddLab = async () => {
    try {
      const res = await fetch("/api/medical-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          type: "lab",
          ...labForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowLabModal(false);

        setLabForm({
          test: "",
          result: "",
          normalRange: "",
          date: "",
          status: "Normal",
        });

        fetchMedicalHistory();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchMedicalHistory();
  }, [user?.id]);

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Medical History</h1>
            <p className="mt-2 text-zinc-400">Your complete health records and medical information</p>
          </div>

          {/* Patient Info Card */}
          <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                  {loading ? '...' : profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {loading ? 'Loading...' : profile?.name || 'User'}
                  </h2>
                  <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="text-zinc-400">
                      <span className="text-zinc-500">Age:</span> {loading ? '...' : profile?.age ? `${profile.age} years` : 'N/A'}
                    </div>
                    <div className="text-zinc-400">
                      <span className="text-zinc-500">Gender:</span> {loading ? '...' : profile?.gender || 'N/A'}
                    </div>
                    <div className="text-zinc-400">
                      <span className="text-zinc-500">Height:</span> {loading ? '...' : profile?.height ? `${profile.height} cm` : 'N/A'}
                    </div>
                    <div className="text-zinc-400">
                      <span className="text-zinc-500">Weight:</span> {loading ? '...' : profile?.weight ? `${profile.weight} kg` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={downloadMedicalRecord}
                className="cursor-pointer rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                Download Records
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-zinc-800">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            {/* Medical Conditions */}
            {activeTab === 'conditions' && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Medical Conditions</h3>
                  <button
                    onClick={() => setShowConditionModal(true)}
                    className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    + Add Condition
                  </button>
                </div>
                <div className="space-y-4">
                  {medicalHistory?.medicalConditions?.map((condition) => (
                    <div key={condition._id} className="rounded-lg border border-zinc-800 bg-black/50 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white">{condition.condition}</h4>
                          <p className="mt-1 text-sm text-zinc-400">
                            Diagnosed:{" "}
                            {condition.diagnosedDate
                              ? formatDate(condition.diagnosedDate)
                              : "N/A"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(condition.status)}`}>
                            {condition.status}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityColor(condition.severity)}`}>
                            {condition.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {activeTab === 'allergies' && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Allergies</h3>
                  <button
                    onClick={() => setShowAllergyModal(true)}
                    className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Allergy
                  </button>
                </div>
                <div className="space-y-4">
                  {medicalHistory?.allergies?.map((allergy) => (
                    <div
                      key={allergy._id}
                      className="rounded-lg border border-zinc-800 bg-black/50 p-4"
                    >
                      <div className="flex items-start justify-between">

                        <div className="flex-1">

                          <h4 className="text-lg font-semibold text-white">
                            {allergy.allergen}
                          </h4>

                          <p className="mt-1 text-sm text-zinc-400">
                            Reaction: {allergy.reaction || "N/A"}
                          </p>

                          <p className="mt-1 text-sm text-zinc-400">
                            Diagnosed: {formatDate(allergy.diagnosedDate)}
                          </p>

                        </div>

                        <div className="flex space-x-2">

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                              allergy.status || "Active"
                            )}`}
                          >
                            {allergy.status || "Active"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getSeverityColor(
                              allergy.severity
                            )}`}
                          >
                            {allergy.severity}
                          </span>

                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Surgeries */}
            {activeTab === 'surgeries' && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Past Surgeries</h3>
                  <button
                    onClick={() => setShowSurgeryModal(true)}
                    className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Surgery
                  </button>
                </div>
                <div className="space-y-4">
                  {medicalHistory?.surgeries?.map((surgery) => (
                    <div
                      key={surgery._id}
                      className="rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-black p-5 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
                    >
                      <div className="flex items-start justify-between">

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl border border-cyan-500/20">
                            🔬
                          </div>

                          <div>

                            <h4 className="text-lg font-semibold text-white">
                              {surgery.procedure}
                            </h4>

                            <div className="mt-3 flex flex-wrap gap-3">

                              <div className="rounded-lg bg-zinc-800/70 px-3 py-2">
                                <p className="text-xs text-zinc-500">
                                  Surgery Date
                                </p>
                                <p className="text-sm font-medium text-zinc-200">
                                  {formatDate(surgery.date)}
                                </p>
                              </div>

                              <div className="rounded-lg bg-zinc-800/70 px-3 py-2">
                                <p className="text-xs text-zinc-500">
                                  Hospital
                                </p>
                                <p className="text-sm font-medium text-zinc-200">
                                  {surgery.hospital || "N/A"}
                                </p>
                              </div>

                            </div>

                          </div>

                        </div>

                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                          Surgery
                        </span>

                      </div>

                      {surgery.notes && (
                        <div className="mt-5 rounded-lg border border-zinc-800 bg-black/40 p-4">
                          <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                            Notes
                          </p>

                          <p className="text-sm leading-6 text-zinc-300">
                            {surgery.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family History */}
            {activeTab === 'family' && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Family Medical History</h3>
                  <button
                    onClick={() => setShowFamilyModal(true)}
                    className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Family History
                  </button>
                </div>
                <div className="space-y-4">
                  {medicalHistory?.familyHistory?.map((record) => (
                    <div key={record._id} className="rounded-lg border border-zinc-800 bg-black/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{record.relation}</h4>
                          <p className="mt-1 text-sm text-zinc-400">{record.condition}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-500">Age of Onset</p>
                          <p className="text-lg font-semibold text-white">{record.ageOfOnset} yrs</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Results */}
            {activeTab === 'labs' && (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Recent Lab Results</h3>
                  <button
                    onClick={() => setShowLabModal(true)}
                    className="cursor-pointer text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Lab Result
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Test Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Result
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Normal Range
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {medicalHistory?.labResults?.map((lab) => (
                        <tr key={lab._id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-4 py-4 text-sm font-medium text-white">{lab.test}</td>
                          <td className="px-4 py-4 text-sm text-white">{lab.result}</td>
                          <td className="px-4 py-4 text-sm text-zinc-400">{lab.normalRange}</td>
                          <td className="px-4 py-4 text-sm text-zinc-400">{formatDate(lab.date)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(lab.status)}`}>
                              {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-white">
                Add Medical Condition
              </h2>

              <button
                onClick={() => setShowConditionModal(false)}
                className="cursor-pointer text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Condition Name
                </label>

                <input
                  type="text"
                  value={conditionForm.condition}
                  onChange={(e) =>
                    setConditionForm({
                      ...conditionForm,
                      condition: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Diagnosed Date
                </label>

                <input
                  type="date"
                  value={conditionForm.diagnosedDate}
                  onChange={(e) =>
                    setConditionForm({
                      ...conditionForm,
                      diagnosedDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Status
                  </label>

                  <select
                    value={conditionForm.status}
                    onChange={(e) =>
                      setConditionForm({
                        ...conditionForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white"
                  >
                    <option>Active</option>
                    <option>Controlled</option>
                    <option>Recovered</option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Severity
                  </label>

                  <select
                    value={conditionForm.severity}
                    onChange={(e) =>
                      setConditionForm({
                        ...conditionForm,
                        severity: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white"
                  >
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                  </select>

                </div>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={() => setShowConditionModal(false)}
                className="cursor-pointer rounded-lg border border-zinc-700 px-5 py-2 text-white hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleAddCondition}
                className="cursor-pointer rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}
      {showAllergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-white">
                Add Allergy
              </h2>

              <button
                onClick={() => setShowAllergyModal(false)}
                className="cursor-pointer text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Allergen
                </label>

                <input
                  type="text"
                  value={allergyForm.allergen}
                  onChange={(e) =>
                    setAllergyForm({
                      ...allergyForm,
                      allergen: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Reaction
                </label>

                <input
                  type="text"
                  value={allergyForm.reaction}
                  onChange={(e) =>
                    setAllergyForm({
                      ...allergyForm,
                      reaction: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Diagnosed Date
                </label>

                <input
                  type="date"
                  value={allergyForm.diagnosedDate}
                  onChange={(e) =>
                    setAllergyForm({
                      ...allergyForm,
                      diagnosedDate: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Status
                  </label>

                  <select
                    value={allergyForm.status}
                    onChange={(e) =>
                      setAllergyForm({
                        ...allergyForm,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    <option>Active</option>
                    <option>Controlled</option>
                    <option>Recovered</option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Severity
                  </label>

                  <select
                    value={allergyForm.severity}
                    onChange={(e) =>
                      setAllergyForm({
                        ...allergyForm,
                        severity: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                  >
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                  </select>

                </div>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={() => setShowAllergyModal(false)}
                className="cursor-pointer rounded-lg border border-zinc-700 px-5 py-2 text-white hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleAddAllergy}
                className="cursor-pointer rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}
      {showSurgeryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-white">
                Add Surgery
              </h2>

              <button
                onClick={() => setShowSurgeryModal(false)}
                className="cursor-pointer text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Procedure Name
                </label>

                <input
                  type="text"
                  value={surgeryForm.procedure}
                  onChange={(e) =>
                    setSurgeryForm({
                      ...surgeryForm,
                      procedure: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Hospital
                </label>

                <input
                  type="text"
                  value={surgeryForm.hospital}
                  onChange={(e) =>
                    setSurgeryForm({
                      ...surgeryForm,
                      hospital: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Surgery Date
                </label>

                <input
                  type="date"
                  value={surgeryForm.date}
                  onChange={(e) =>
                    setSurgeryForm({
                      ...surgeryForm,
                      date: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={surgeryForm.notes}
                  onChange={(e) =>
                    setSurgeryForm({
                      ...surgeryForm,
                      notes: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500 resize-none"
                />
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={() => setShowSurgeryModal(false)}
                className="cursor-pointer rounded-lg border border-zinc-700 px-5 py-2 text-white hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleAddSurgery}
                className="cursor-pointer rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-white">
                Add Family History
              </h2>

              <button
                onClick={() => setShowFamilyModal(false)}
                className="cursor-pointer text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Relation
                </label>

                <input
                  type="text"
                  value={familyForm.relation}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      relation: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Medical Condition
                </label>

                <input
                  type="text"
                  value={familyForm.condition}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      condition: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Age Of Onset
                </label>

                <input
                  type="number"
                  value={familyForm.ageOfOnset}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      ageOfOnset: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={() => setShowFamilyModal(false)}
                className="cursor-pointer rounded-lg border border-zinc-700 px-5 py-2 text-white hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleAddFamily}
                className="cursor-pointer rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-xl font-bold text-white">
                Add Lab Result
              </h2>

              <button
                onClick={() => setShowLabModal(false)}
                className="cursor-pointer text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Test Name
                </label>

                <input
                  type="text"
                  value={labForm.test}
                  onChange={(e) =>
                    setLabForm({
                      ...labForm,
                      test: e.target.value
                    })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Result
                  </label>

                  <input
                    type="text"
                    value={labForm.result}
                    onChange={(e) =>
                      setLabForm({
                        ...labForm,
                        result: e.target.value
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Normal Range
                  </label>

                  <input
                    type="text"
                    value={labForm.normalRange}
                    onChange={(e) =>
                      setLabForm({
                        ...labForm,
                        normalRange: e.target.value
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                  />

                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Date
                  </label>

                  <input
                    type="date"
                    value={labForm.date}
                    onChange={(e) =>
                      setLabForm({
                        ...labForm,
                        date: e.target.value
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm text-zinc-400">
                    Status
                  </label>

                  <select
                    value={labForm.status}
                    onChange={(e) =>
                      setLabForm({
                        ...labForm,
                        status: e.target.value
                      })
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-2 text-white outline-none focus:border-cyan-500"
                  >

                    <option>Normal</option>
                    <option>Elevated</option>
                    <option>Critical</option>

                  </select>

                </div>

              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button
                onClick={() => setShowLabModal(false)}
                className="cursor-pointer rounded-lg border border-zinc-700 px-5 py-2 text-white hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleAddLab}
                className="cursor-pointer rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}
      <UserFooter />
    </>
  );
}
