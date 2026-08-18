'use client';

import { useEffect, useMemo, useState } from 'react';

const DAY = 24 * 60 * 60 * 1000;

const LIFTERS = [
  'That pretty smile of yours could fix a terrible day instantly. 😭💗',
  'Reminder: you are ridiculously easy to love.',
  'Your eyes are actually unfair. Like… calm down 😭👀',
  'Smart, pretty and still somehow mine? Crazy work. 🥹❤️',
  'Your accent has no business sounding that good frr 😭🎙️',
  'Snow & Ice!! 😭❄️ You already know.',
  'You make ordinary days feel way less ordinary.',
  'I love how your mind works. Your intellect is genuinely attractive.',
  'You are one of my favourite parts of being alive right now. 💞',
  'I hope you know how pretty you are even when you are not trying.',
  'Your height? Perfect. I said what I said 😌💗',
  'Somehow you can be my peace and still be the person making me laugh like an idiot 😂❤️',
  'You deserve soft days, good news and a ridiculous amount of love.',
  'There is literally nobody else I would rather build this little world with. 💗',
];

function splitDuration(ms) {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / DAY),
    hours: Math.floor((safe % DAY) / 3600000),
    minutes: Math.floor((safe % 3600000) / 60000),
    seconds: Math.floor((safe % 60000) / 1000),
  };
}

function lagosDateParts(now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(now));

  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
}

function nextBirthday(now) {
  const { year, month, day } = lagosDateParts(now);
  const birthdayHasStarted = month > 3 || (month === 3 && day >= 11);
  const targetYear = birthdayHasStarted ? year + 1 : year;
  // March 11, 12:00 AM WAT = March 10, 11:00 PM UTC.
  return {
    year: targetYear,
    time: Date.UTC(targetYear, 2, 10, 23, 0, 0),
  };
}

export default function LoveExtras({ user }) {
  const myName = user === 'joy' ? 'Joy' : 'Ozioma';
  const [now, setNow] = useState(Date.now());
  const [memories, setMemories] = useState([]);
  const [memoryText, setMemoryText] = useState('');
  const [pulledMemory, setPulledMemory] = useState(null);
  const [lifter, setLifter] = useState('Tap the button whenever you need a tiny boost. 💗');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const birthday = useMemo(() => nextBirthday(now), [now]);
  const birthdayLeft = splitDuration(birthday.time - now);

  const loadMemories = async () => {
    try {
      const response = await fetch('/api/couple-state', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setMemories(Array.isArray(data.state?.memories) ? data.state.memories : []);
    } catch {
      // Keep the rest of the page usable even if sync is briefly unavailable.
    }
  };

  useEffect(() => {
    loadMemories();
    const poll = setInterval(loadMemories, 12000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addMemory = async (event) => {
    event.preventDefault();
    const value = memoryText.trim();
    if (!value || saving) return;

    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/api/couple-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'memory-add', value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save memory.');
      setMemories(Array.isArray(data.state?.memories) ? data.state.memories : []);
      setMemoryText('');
      setStatus('Dropped into the jar 🫙💗');
      setTimeout(() => setStatus(''), 2200);
    } catch (error) {
      setStatus(error.message || 'Could not save memory.');
    } finally {
      setSaving(false);
    }
  };

  const pullMemory = () => {
    if (!memories.length) {
      setPulledMemory({ text: 'The jar is empty for now — drop your first memory in. 🥹', by: '' });
      return;
    }

    let chosen = memories[Math.floor(Math.random() * memories.length)];
    if (memories.length > 1 && chosen.id === pulledMemory?.id) {
      chosen = memories[(memories.findIndex((item) => item.id === chosen.id) + 1) % memories.length];
    }
    setPulledMemory(chosen);
  };

  const liftMood = () => {
    let next = LIFTERS[Math.floor(Math.random() * LIFTERS.length)];
    if (LIFTERS.length > 1 && next === lifter) {
      next = LIFTERS[(LIFTERS.indexOf(next) + 1) % LIFTERS.length];
    }
    setLifter(next);
  };

  return (
    <section className="extras-zone">
      <div className="extras-heading">
        <span className="eyebrow">MORE OF OUR LITTLE WORLD</span>
        <h2>Small things that keep us close 💞</h2>
      </div>

      <div className="birthday-card glass-panel">
        <div className="birthday-copy">
          <span className="eyebrow">JOY’S NEXT BIRTHDAY 🎂</span>
          <h3>March 11, {birthday.year}</h3>
          <p>Counting every second until your day. 💗</p>
        </div>
        <div className="birthday-timer" aria-label={`${birthdayLeft.days} days until Joy's birthday`}>
          <div><strong>{birthdayLeft.days}</strong><span>days</span></div>
          <div><strong>{String(birthdayLeft.hours).padStart(2, '0')}</strong><span>hours</span></div>
          <div><strong>{String(birthdayLeft.minutes).padStart(2, '0')}</strong><span>mins</span></div>
          <div><strong>{String(birthdayLeft.seconds).padStart(2, '0')}</strong><span>secs</span></div>
        </div>
      </div>

      <div className="extras-grid">
        <article className="memory-jar-card glass-panel">
          <div className="jar-topline">
            <div>
              <span className="eyebrow">OUR DIGITAL MEMORY JAR</span>
              <h3>🫙 {memories.length} {memories.length === 1 ? 'memory' : 'memories'} inside</h3>
            </div>
            <div className="jar-visual" aria-hidden="true">
              <span>💗</span><span>✨</span><span>🥹</span><span>💕</span>
            </div>
          </div>

          <form className="memory-form" onSubmit={addMemory}>
            <textarea
              value={memoryText}
              onChange={(event) => setMemoryText(event.target.value)}
              maxLength={220}
              placeholder={`Drop a happy memory in, ${myName}...`}
            />
            <div className="memory-actions">
              <small>{memoryText.length}/220</small>
              <button type="submit" disabled={saving || !memoryText.trim()}>{saving ? 'Saving…' : 'Drop it in 🫙'}</button>
            </div>
          </form>
          {status && <p className="memory-status">{status}</p>}

          <button type="button" className="pull-memory-button" onClick={pullMemory}>✨ Shake jar & pull a memory</button>

          {pulledMemory && (
            <div className="memory-reveal" key={pulledMemory.id || pulledMemory.text}>
              <span className="eyebrow">YOU PULLED THIS ONE</span>
              <blockquote>“{pulledMemory.text}”</blockquote>
              {pulledMemory.by && <small>Added by {pulledMemory.by === 'joy' ? 'Joy' : 'Ozioma'} 💗</small>}
            </div>
          )}
        </article>

        <article className="mood-lifter-card glass-panel">
          <span className="eyebrow">EMERGENCY SOFTNESS BUTTON 😭</span>
          <h3>Mood Lifter 💗</h3>
          <div className="lifter-message" key={lifter}>{lifter}</div>
          <button type="button" className="lifter-button" onClick={liftMood}>💞 Lift my mood</button>
          <p className="tiny">Random compliments, reasons I love you and our unserious little references.</p>
        </article>
      </div>
    </section>
  );
}
