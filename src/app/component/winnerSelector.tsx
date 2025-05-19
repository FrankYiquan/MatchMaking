'use client';

import React, { useState } from 'react';

type WinnerSelectorProps = {
  matchID: string;
  time: string; // ISO string or datetime string
  email1: string;
  email2: string;
};

const WinnerSelector: React.FC<WinnerSelectorProps> = ({ matchID, time, email1, email2 }) => {
  const matchTime = new Date(time);
  const isPast = new Date() > matchTime;

  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedWinner) return;
    setLoading(true);
    try {
        await fetch('/api/selectWinner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              matchID,
              winner: selectedWinner,
            }),
          });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit winner:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isPast && !submitted && (
        <>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => setSelectedWinner(email1)}
              disabled={loading}
            >
               {email1}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedWinner(email2)}
              disabled={loading}
            >
              {email2}
            </button>
          </div>

          {selectedWinner && (
            <div>
              <p>Selected Winner: <strong>{selectedWinner}</strong></p>
              <button
                className="btn btn-success mt-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Confirm Winner'}
              </button>
            </div>
          )}
        </>
      )}

      {submitted && (
        <p className="text-green-600">✅ Winner submitted successfully!</p>
      )}
    </div>
  );
};

export default WinnerSelector;
