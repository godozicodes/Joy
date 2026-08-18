'use client';

import { useEffect, useState } from 'react';

// June 3, 2026 at 9:00 PM in Nigeria (WAT, UTC+1).
const START_TIME = Date.UTC(2026, 5, 3, 20, 0, 0);
const ONE_DAY = 1000 * 60 * 60 * 24;

function getDaysTogether() {
  return Math.max(0, Math.floor((Date.now() - START_TIME) / ONE_DAY));
}

export default function DaysTogether() {
  const [days, setDays] = useState(getDaysTogether);

  useEffect(() => {
    const updateDays = () => setDays(getDaysTogether());
    const timer = setInterval(updateDays, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="days-card" aria-label={`${days} full days together since June 3, 2026 at 9 PM`}>
      <span className="days-kicker">Since June 3, 2026 • 9:00 PM 💞</span>
      <strong className="days-number">{days}</strong>
      <span className="days-label">full days of us & counting</span>
      <span className="days-note">Every new day with us begins at 9 PM.</span>
    </div>
  );
}
