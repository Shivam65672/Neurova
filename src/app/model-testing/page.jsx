'use client';

import { useState } from 'react';
import UserNav from '@/components/UserNav';
import UserFooter from '@/components/UserFooter';

export default function BPPredictionPage() {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const res = await fetch('/api/predict-bp', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.status === 'success') {
        console.log("data", data.data)
        setPrediction(data.data);
      } else {
        setError(data.message || 'Failed to fetch prediction');
      }
    } catch (err) {
      setError('Failed to fetch prediction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserNav />
      <div className="min-h-screen bg-black px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-2">BP Prediction</h1>
          <p className="text-zinc-400 mb-6">
            Predict your blood pressure stage and get recommended medications, diet, and exercise.
          </p>

          <button
            onClick={fetchPrediction}
            className="mb-8 rounded-xl bg-linear-to-r from-cyan-500 to-teal-600 px-6 py-3 text-white font-semibold hover:from-cyan-600 hover:to-teal-700 transition-all"
          >
            {loading ? 'Predicting...' : 'Get Prediction'}
          </button>

          {error && (
            <div className="mb-4 rounded-lg bg-red-900/50 p-4 text-red-300">
              {error}
            </div>
          )}

          {prediction && (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Stage */}
              <div className="rounded-xl bg-purple-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Stage of BP</h2>
                <p className="text-purple-200 text-lg">{prediction.stage}</p>
              </div>

              {/* Top 3 Medications */}
              <div className="rounded-xl bg-purple-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Top 3 Medications</h2>
                <ul className="list-disc list-inside text-purple-200">
                  {prediction.top3_medications.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              </div>

              {/* Diet */}
              <div className="rounded-xl bg-purple-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Diet Recommendations</h2>
                <p className="text-purple-200">{prediction.diet}</p>
              </div>

              {/* Dosage */}
              <div className="rounded-xl bg-purple-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Dosage</h2>
                <p className="text-purple-200">{prediction.dosage}</p>
              </div>

              {/* Usage */}
              <div className="rounded-xl bg-purple-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Usage Instructions</h2>
                <p className="text-purple-200">{prediction.usage}</p>
              </div>

              {/* Exercise */}
              <div className="rounded-xl bg-purple-900/50 p-6">
                <h2 className="text-xl font-bold text-white mb-2">Exercise Recommendations</h2>
                <p className="text-purple-200">{prediction.exercise}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <UserFooter />
    </>
  );
}
