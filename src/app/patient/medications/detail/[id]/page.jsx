'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DocNav from '@/components/DocNav';
import DocFooter from '@/components/DocFooter';

export default function PrescriptionDetailPage() {
  const params = useParams();
  const { id } = params; // URL param /patient/medication/[id]
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/get-prescription-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prescriptionId: id }),
        });

        const data = await res.json();
        if (data.success) {
          setPrescription(data.data);
        } else {
          setError(data.error || 'Failed to fetch prescription');
        }
      } catch (err) {
        setError('Error fetching prescription: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPrescription();
  }, [id]);

  if (loading) return <div className="text-white p-4">Loading prescription...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!prescription) return <div className="text-white p-4">No prescription found.</div>;

  // Format date
  const formattedDate = new Date(prescription.datePredicted).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <DocNav />
      <div className="min-h-screen bg-black px-4 py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Prescription Details</h1>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <p><span className="font-semibold text-white">Patient Name:</span> {prescription.patientName}</p>
          <p><span className="font-semibold text-white">Age:</span> {prescription.patientAge}</p>
          <p><span className="font-semibold text-white">Stage:</span> {prescription.stage}</p>
          <p><span className="font-semibold text-white">Medications:</span> {prescription.medications.join(', ')}</p>
          <p><span className="font-semibold text-white">Diet:</span> {prescription.diet}</p>
          <p><span className="font-semibold text-white">Dosage:</span> {prescription.dosage}</p>
          <p><span className="font-semibold text-white">Usage:</span> {prescription.usage}</p>
          <p><span className="font-semibold text-white">Exercise:</span> {prescription.exercise}</p>
          <p>
            <span className="font-semibold text-white">Status:</span>{' '}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              prescription.prescriptionStatus === 'approved'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {prescription.prescriptionStatus.charAt(0).toUpperCase() + prescription.prescriptionStatus.slice(1)}
            </span>
          </p>
          <p><span className="font-semibold text-white">Date Predicted:</span> {formattedDate}</p>
        </div>
      </div>
      <DocFooter />
    </>
  );
}
