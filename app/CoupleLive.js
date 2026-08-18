'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const START_TIME = Date.UTC(2026, 5, 7, 20, 0, 0); // June 7, 9 PM WAT
const DAY = 86400000;
const MOODS = ['Missing you 🥲', 'Happyyy 😭💕', 'Thinking about you 💭', 'Sweet & calm 💗', 'Need cuddles 🥹', 'Very unserious 😂❤️'];
const MEMORIES = [
  'June 7 • 9:00 PM — the exact moment our clock started. 💞',
  'Tiny reminder: even the ordinary days count because they are ours. ❤️',
  'Another day added to a story that is still being written. ✨',
  'Somewhere between the jokes, calls and random moments, “us” became home. 🫶',
  'Today’s memory is simple: you chose each other again today. 💗',
  'No big occasion needed — this day belongs in the story too. 🌙',
  'One more sunrise, one more sunset, one more day of us. ☀️💞',
];

function splitDuration(ms) {
  const value = Math.max(0, ms);
  const days = Math.floor(value / DAY);
  const hours = Math.floor((value % DAY) / 3600000);
  const minutes = Math.floor((value % 3600000) / 60000);
  const seconds = Math.floor((value % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function nextMilestone(now) {
  const milestones = [
    { label: '75 days together 💗', time: START_TIME + 75 * DAY },
    { label: '100 days together 🥹', time: START_TIME + 100 * DAY },
    { label: '6 months together 💞', time: Date.UTC(2026, 11, 7, 20, 0, 0) },
    { label: '1 year together ❤️', time: Date.UTC(2027, 5, 7, 20, 0, 0) },
    { label: '500 days together ✨', time: START_TIME + 500 * DAY },
    { label: '2 years together 💍', time: Date.UTC(2028, 5, 7, 20, 0, 0) },
  ];
  return milestones.find((item) => item.time > now) || milestones[milestones.length - 1];
}

function greetingFor(now, otherName) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(now)));

  if (hour < 5) return `You two should probably be sleeping 😭❤️`;
  if (hour < 12) return `Good morning, ${otherName} ☀️💗`;
  if (hour < 17) return `Good afternoon, ${otherName} 🌸`;
  if (hour < 21) return `Good evening, ${otherName} 🌙💞`;
  return `Late-night us hits different 🥹❤️`;
}

export default function CoupleLive({ user }) {
  const me = user === 'joy' ? 'joy' : 'ozioma';
  const other = me === 'joy' ? 'ozioma' : 'joy';
  const myName = me === 'joy' ? 'Joy' : 'Ozioma';
  const otherName = other === 'joy' ? 'Joy' : 'Ozioma';

  const [now, setNow] = useState(Date.now());
  const [shared, setShared] = useState(null);
  const [online, setOnline] = useState({ ozioma: false, joy: false });
  const [persistent, setPersistent] = useState(false);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');
  const [kissBurst, setKissBurst] = useState(false);
  const [heartHeld, setHeartHeld] = useState(false);
  const lastKiss = useRef('');

  const elapsed = splitDuration(now - START_TIME);
  const milestone = useMemo(() => nextMilestone(now), [now]);
  const untilMilestone = splitDuration(milestone.time - now);
  const memory = MEMORIES[elapsed.days % MEMORIES.length];
  const greeting = greetingFor(now, otherName);

  const loadState = async (showIncoming = true) => {
    try {
      const response = await fetch('/api/couple-state', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setShared(data.state);
      setOnline(data.online || {});
      setPersistent(Boolean(data.persistent));

      const kiss = data.state?.kiss;
      if (!lastKiss.current && kiss?.id) lastKiss.current = kiss.id;
      else if (showIncoming && kiss?.id && kiss.id !== lastKiss.current) {
        lastKiss.current = kiss.id;
        if (kiss.from === other) {
          setKissBurst(true);
          setToast(`${otherName} sent you a kiss 💋`);
          if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
          setTimeout(() => setKissBurst(false), 2200);
          setTimeout(() => setToast(''), 3200);
        }
      }
    } catch {
      // The romantic timer keeps working even if live sync is briefly unavailable.
    }
  };

  const sendAction = async (action, value = '') => {
    try {
      const response = await fetch('/api/couple-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      setShared(data.state);
      setOnline(data.online || {});
      setPersistent(Boolean(data.persistent));
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    loadState(false);
    sendAction('presence');
    const presenceTimer = setInterval(() => sendAction('presence'), 15000);
    const pollTimer = setInterval(() => loadState(true), 4000);
    return () => {
      clearInterval(presenceTimer);
      clearInterval(pollTimer);
    };
  }, []);

  const setMood = async (mood) => {
    if (await sendAction('mood', mood)) {
      setToast(`Mood updated: ${mood}`);
      setTimeout(() => setToast(''), 2200);
    }
  };

  const saveNote = async (event) => {
    event.preventDefault();
    if (await sendAction('note', note)) {
      setNote('');
      setToast(`Your note is waiting for ${otherName} 💌`);
      setTimeout(() => setToast(''), 2500);
    }
  };

  const sendKiss = async () => {
    if (await sendAction('kiss')) {
      setKissBurst(true);
      setToast(`Kiss sent to ${otherName} 💋`);
      setTimeout(() => setKissBurst(false), 1300);
      setTimeout(() => setToast(''), 2300);
    }
  };

  const otherLastSeen = Number(shared?.presence?.[other] || 0);
  const otherOnline = Boolean(online?.[other]);
  const otherMood = shared?.moods?.[other] || 'No mood yet 💭';
  const myMood = shared?.moods?.[me] || 'No mood yet 💭';
  const otherNote = shared?.notes?.[other]?.text || '';
  const myNote = shared?.notes?.[me]?.text || '';

  const badges = [30, 50, 75, 100, 180, 365];

  return (
    <section className="live-zone">
      {toast && <div className="love-toast">{toast}</div>}
      {kissBurst && <div className="kiss-burst" aria-hidden="true">💋💕💋</div>}

      <div className="live-heading">
        <span className="live-dot" />
        <div>
          <small>OUR LITTLE WORLD • LIVE</small>
          <h2>{greeting}</h2>
        </div>
      </div>

      <div className="exact-timer glass-panel">
        <span className="eyebrow">Together for exactly</span>
        <div className="timer-row">
          <div><strong>{elapsed.days}</strong><span>days</span></div>
          <div><strong>{String(elapsed.hours).padStart(2, '0')}</strong><span>hours</span></div>
          <div><strong>{String(elapsed.minutes).padStart(2, '0')}</strong><span>mins</span></div>
          <div><strong>{String(elapsed.seconds).padStart(2, '0')}</strong><span>secs</span></div>
        </div>
        <p>Since June 7, 2026 at exactly 9:00 PM 💞</p>
      </div>

      <div className="live-grid">
        <article className="glass-panel milestone-card">
          <span className="eyebrow">Next milestone</span>
          <h3>{milestone.label}</h3>
          <div className="mini-countdown">{untilMilestone.days}d {untilMilestone.hours}h {untilMilestone.minutes}m {untilMilestone.seconds}s</div>
          <p className="muted">The next little excuse to celebrate us.</p>
        </article>

        <article className="glass-panel presence-card">
          <span className="eyebrow">Right now</span>
          <h3>{otherOnline ? `${otherName} is here with you 💗` : `${otherName} is offline for now 🌙`}</h3>
          <p className="muted">Your mood: <strong>{myMood}</strong></p>
          <p className="muted">{otherName}’s mood: <strong>{otherMood}</strong></p>
          {!otherOnline && otherLastSeen > 0 && <p className="tiny">Last seen {new Date(otherLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
        </article>

        <article className="glass-panel today-card">
          <span className="eyebrow">Today in us</span>
          <h3>Day {elapsed.days} ❤️</h3>
          <p>{memory}</p>
          <div className="badges">
            {badges.map((badge) => <span key={badge} className={elapsed.days >= badge ? 'badge unlocked' : 'badge'}>{elapsed.days >= badge ? '✓ ' : ''}{badge}d</span>)}
          </div>
        </article>

        <article className="glass-panel heartbeat-card">
          <span className="eyebrow">Heartbeat</span>
          <button
            type="button"
            className={`heart-button ${heartHeld ? 'held' : ''}`}
            onPointerDown={() => setHeartHeld(true)}
            onPointerUp={() => setHeartHeld(false)}
            onPointerLeave={() => setHeartHeld(false)}
          >❤️</button>
          <p className="muted">Hold the heart for a second. Corny? Yes. Cute? Also yes 😭</p>
        </article>
      </div>

      <div className="glass-panel mood-panel">
        <div>
          <span className="eyebrow">Set your mood</span>
          <h3>What’s your vibe, {myName}?</h3>
        </div>
        <div className="mood-buttons">
          {MOODS.map((mood) => <button type="button" key={mood} className={myMood === mood ? 'mood active' : 'mood'} onClick={() => setMood(mood)}>{mood}</button>)}
        </div>
      </div>

      <div className="notes-grid">
        <article className="glass-panel note-card">
          <span className="eyebrow">From {otherName}</span>
          <h3>💌 Love note</h3>
          <p className={otherNote ? 'note-text' : 'muted'}>{otherNote || `${otherName} hasn’t left a note yet.`}</p>
        </article>

        <article className="glass-panel note-card">
          <span className="eyebrow">Leave something behind</span>
          <form onSubmit={saveNote}>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={180} placeholder={`Write something for ${otherName}...`} />
            <div className="note-actions">
              <small>{note.length}/180</small>
              <button type="submit">Save love note 💌</button>
            </div>
          </form>
          {myNote && <p className="tiny">Your current note: “{myNote}”</p>}
        </article>
      </div>

      <div className="kiss-panel glass-panel">
        <div>
          <span className="eyebrow">One tap away</span>
          <h3>Send {otherName} something stupidly cute 😭</h3>
          <p className="muted">If {otherName} is on the site, the kiss pops up on their screen.</p>
        </div>
        <button type="button" className="kiss-button" onClick={sendKiss}>💋 Send {otherName} a kiss</button>
      </div>

      {!persistent && (
        <p className="sync-note">Live cards are active. Cross-device persistence will become permanent automatically once a Vercel Redis/Upstash store is connected.</p>
      )}
    </section>
  );
}
