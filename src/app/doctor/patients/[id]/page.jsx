'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';
import { useDoctorProfile } from '@/hooks/useDoctorProfile';
import { useUser } from "@clerk/nextjs";

export default function PrescriptionReview() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { profile: doctorProfile, loading: doctorLoading } = useDoctorProfile();

  // ✅ Scroll to top with delay to ensure content is loaded
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    if (!loading) {
      window.scrollTo(0, 0);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await fetch(`/api/get-prescription-details?id=${params.id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (data.success) {
          setPrescription(data.data);
          setEditedData(data.data);
        } else {
          console.error('Failed to fetch prescription');
        }
      } catch (err) {
        console.error('Error fetching prescription:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(prescription);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/update-prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prescription._id,
          ...editedData,
          prescriptionStatus: prescription.prescriptionStatus,
          doctorName: doctorProfile?.name || user?.fullName || 'Verified Doctor',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrescription(data.data);
        setEditedData(data.data);
        setIsEditing(false);
        alert('Prescription updated successfully!');
        router.refresh();
      } else {
        alert('Failed to update prescription');
      }
    } catch (err) {
      console.error('Error updating prescription:', err);
      alert('Error updating prescription');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/update-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          prescriptionStatus: 'approved',
          doctorName: doctorProfile?.name || user?.fullName || 'Verified Doctor',
          doctorId: user?.id || '',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrescription(data.data);
        setEditedData(data.data);
        alert('Prescription approved successfully!');
        router.push('/doctor/patients');
      } else {
        alert('Failed to approve prescription');
      }
    } catch (err) {
      console.error('Error approving prescription:', err);
      alert('Error approving prescription');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setSaving(true);
    try {
      // Get doctor name from profile or user
      const doctorName = doctorProfile?.name || user?.fullName || 'Verified Doctor';
      const doctorId = user?.id || '';

      const rejectData = {
        id: params.id,
        prescriptionStatus: 'rejected',
        doctorName: doctorName, // Make sure this is sent
        doctorId: doctorId,
        rejectionReason: rejectReason.trim(),
      };

      console.log("📤 Sending reject data:", rejectData);

      const res = await fetch('/api/update-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rejectData),
      });

      const data = await res.json();
      console.log("📥 Reject response:", data);

      if (data.success) {
        setPrescription(data.data);
        setEditedData(data.data);
        alert('Prescription rejected successfully!');
        setShowRejectModal(false);
        setRejectReason('');
        router.push('/doctor/patients');
      } else {
        alert('Failed to reject prescription: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Error rejecting prescription:', err);
      alert('Error rejecting prescription');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleMedicationsChange = (value) => {
    const meds = value.split(',').map(m => m.trim()).filter(m => m);
    setEditedData({ ...editedData, medications: meds });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'approved':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'normal':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'elevated':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hypertension stage 1':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'hypertension stage 2':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'hypertensive crisis':
        return 'text-red-600 bg-red-600/10 border-red-600/20';
      default:
        return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading || doctorLoading) {
    return (
      <>
        <DocNav />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
            <p className="text-white text-lg">Loading prescription details...</p>
          </div>
        </div>
        <DocFooter />
      </>
    );
  }

  if (!prescription) {
    return (
      <>
        <DocNav />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">❌</span>
            <h3 className="text-xl font-semibold text-white mb-2">Prescription Not Found</h3>
            <p className="text-zinc-400 mb-6">The prescription you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/doctor/patients')}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Back to Patients
            </button>
          </div>
        </div>
        <DocFooter />
      </>
    );
  }

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/doctor/patients')}
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Patients</span>
            </button>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Prescription Review</h1>
                <p className="mt-2 text-zinc-400">Review and edit AI-generated prescription details</p>
              </div>
              <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wider ${getStatusColor(editedData?.prescriptionStatus)}`}>
                {editedData?.prescriptionStatus || 'pending'}
              </span>
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="mb-6 rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-900/50 to-zinc-800/30 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                {prescription.patientName?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{prescription.patientName}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm sm:gap-6">
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Age:</span> {prescription.patientAge} years
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">Predicted:</span> {formatDate(prescription.datePredicted)}
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStageColor(prescription.stage)}`}>
                    {prescription.stage?.charAt(0).toUpperCase() + prescription.stage?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Details */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {/* Section Header */}
            <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Prescription Details</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Medications */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Medications {isEditing && <span className="text-cyan-400">(comma-separated)</span>}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.medications?.join(', ') || ''}
                    onChange={(e) => handleMedicationsChange(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="e.g., Amlodipine 5mg, Lisinopril 10mg"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {prescription.medications?.map((med, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400">
                        💊 {med}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dosage */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Dosage Instructions</label>
                {isEditing ? (
                  <textarea
                    value={editedData.dosage || ''}
                    onChange={(e) => handleInputChange('dosage', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter dosage instructions..."
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-black/50 px-4 py-3">
                    <p className="text-white whitespace-pre-wrap">{prescription.dosage || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Usage */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Usage Guidelines</label>
                {isEditing ? (
                  <textarea
                    value={editedData.usage || ''}
                    onChange={(e) => handleInputChange('usage', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter usage guidelines..."
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-black/50 px-4 py-3">
                    <p className="text-white whitespace-pre-wrap">{prescription.usage || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Diet */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Dietary Recommendations</label>
                {isEditing ? (
                  <textarea
                    value={editedData.diet || ''}
                    onChange={(e) => handleInputChange('diet', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter dietary recommendations..."
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-black/50 px-4 py-3">
                    <p className="text-white whitespace-pre-wrap">{prescription.diet || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Exercise */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Exercise Recommendations</label>
                {isEditing ? (
                  <textarea
                    value={editedData.exercise || ''}
                    onChange={(e) => handleInputChange('exercise', e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter exercise recommendations..."
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-800 bg-black/50 px-4 py-3">
                    <p className="text-white whitespace-pre-wrap">{prescription.exercise || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* Approval Info - Show if approved */}
              {prescription.prescriptionStatus === 'approved' && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-1">Approved By</h4>
                  <p className="text-sm text-green-300/80">{(('Dr. ' + prescription.doctorName) || 'Verified Doctor')}</p>
                  <p className="text-xs text-green-400/60 mt-2">
                    Approved on: {formatDate(prescription.approvedAt)}
                  </p>
                </div>
              )}

              {/* Rejection Info - Show if rejected */}
              {prescription.prescriptionStatus === 'rejected' && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-1">Rejected By</h4>
                  <p className="text-sm text-red-300/80">{(('Dr. ' + prescription.doctorName) || 'Verified Doctor')}</p>
                  <h4 className="text-sm font-semibold text-red-400 mb-1 mt-3">Rejection Reason</h4>
                  <p className="text-sm text-red-300/80">{prescription.rejectionReason || 'No reason provided'}</p>
                  <p className="text-xs text-red-400/60 mt-2">
                    Rejected on: {formatDate(prescription.rejectedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {!isEditing ? (
                <>
                  {/* Edit button - Only for pending and approved prescriptions */}
                  {prescription.prescriptionStatus !== 'rejected' && (
                    <button
                      onClick={handleEdit}
                      className="cursor-pointer inline-flex items-center space-x-2 rounded-lg border border-cyan-500 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Prescription</span>
                    </button>
                  )}

                  {/* Approve button - Only for pending prescriptions */}
                  {prescription.prescriptionStatus === 'pending' && (
                    <button
                      onClick={handleApprove}
                      disabled={saving}
                      className="cursor-pointer inline-flex items-center space-x-2 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Reject button - Only for pending prescriptions */}
                  {prescription.prescriptionStatus === 'pending' && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={saving}
                      className="cursor-pointer inline-flex items-center space-x-2 rounded-lg bg-linear-to-r from-red-600 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Status badges for non-pending prescriptions */}
                  {prescription.prescriptionStatus === 'approved' && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2">
                      <p className="text-sm text-green-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        This prescription has been approved
                      </p>
                    </div>
                  )}

                  {prescription.prescriptionStatus === 'rejected' && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2">
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        This prescription has been rejected
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Edit Mode
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center space-x-2 rounded-lg bg-linear-to-r from-cyan-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center space-x-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Warning Note - Only for pending */}
          {prescription.prescriptionStatus === 'pending' && (
            <div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-400">AI-Generated Prescription</h4>
                  <p className="mt-1 text-sm text-yellow-300/80">
                    This prescription was generated by AI. Please review all details carefully before approving or rejecting. You can edit any field if needed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Reject Prescription</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Please provide a reason for rejecting this prescription
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="cursor-pointer text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="e.g., Incorrect dosage, Medication not suitable, Missing information..."
                autoFocus
              />
              <p className="text-xs text-zinc-500 mt-1">
                This reason will be visible to the patient
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={saving || !rejectReason.trim()}
                className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span>Rejecting...</span>
                  </div>
                ) : (
                  'Reject Prescription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <DocFooter />
    </>
  );
}