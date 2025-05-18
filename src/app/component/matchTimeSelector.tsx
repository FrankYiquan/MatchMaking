'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ add this for redirect

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 10; hour <= 21; hour++) {
    for (const min of [0, 30]) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

const MatchTimeSelector: React.FC = () => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const router = useRouter(); // ✅ initialize router
  const [localDate, setLocalDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (startTime >= endTime) {
      alert("End time must be after start time.");
      return;
    }

    const query = new URLSearchParams({
      date,
      startTime,
      endTime,
    }).toString();
  
    router.push(`/beginMatch?${query}`); 
    

  };

  useEffect(() => {
    const today = new Date();
    const adjusted = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    setLocalDate(adjusted);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-8 p-6">
      <h2 className="text-8xl font-bold text-center text-white">Select Match Time</h2>

      {/* Date Picker */}
      <div className="bg-base-400 rounded-box p-10 w-full max-w-md shadow-md">
        <label className="label font-semibold text-3xl mb-2 text-white">Select Date</label>
        <input
          type="date"
          className="select select-bordered w-full h-16 text-lg input-primary text-black dark:text-white"
          value={date}
          min={localDate}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Start Time */}
      <div className="bg-base-400 rounded-box p-10 w-full max-w-md shadow-md">
        <label className="label font-semibold text-3xl mb-2 text-white">Start Time</label>
        <select
          className="select select-bordered w-full h-16 text-lg input-primary text-black dark:text-white"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        >
          <option value="" disabled>Select start time</option>
          {timeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* End Time */}
      <div className="bg-base-400 rounded-box p-10 w-full max-w-md shadow-md">
        <label className="label font-semibold text-3xl mb-2 text-white">End Time</label>
        <select
          className="select select-bordered w-full h-16 text-lg input-primary text-black dark:text-white"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        >
          <option value="" disabled>Select end time</option>
          {timeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button type="submit" className="btn btn-warning w-full max-w-md text-xl h-18">
        Begin Matching your Next Opponent
      </button>
    </form>
  );
};

export default MatchTimeSelector;
