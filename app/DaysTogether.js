'use client';

import { useEffect, useState } from 'react';

const START_DATE = new Date(2026, 5, 3);

function getDaysTogether() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((today - START_DATE) / oneDay));
}

export default function DaysTogether() {
  const [days, setDays] = useState(getDaysTogether);

  useEffect(() => {
    const updateDays = () => setDays(getDaysTogether());
    const timer = setInterval(updateDays, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="days-card" aria-label={`${days} days together since June 3, 2026`}>
      <span className="days-kicker">Since June 3, 2026 💞</span>
      <strong className="days-number">{days}</strong>
      <span className="days-label">days of us & counting</span>
      <span className="days-note">And I’d still choose you from day one.</span>
    </div>
  );
}
