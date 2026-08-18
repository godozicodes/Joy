import { cookies } from 'next/headers';
import DaysTogether from './DaysTogether';
import CoupleLive from './CoupleLive';
import LoveList from './LoveList';
import Wishlist from './Wishlist';
import LoveExtras from './LoveExtras';

export default async function Home() {
  const cookieStore = await cookies();
  const user = cookieStore.get('joy_user')?.value === 'joy' ? 'joy' : 'ozioma';
  const visitorName = user === 'joy' ? 'Joy' : 'Ozioma';

  return (
    <main className="shell">
      <div className="topbar">
        <strong>Ozioma × Joy ❤️</strong>
        <div className="topbar-actions">
          <span className="signed-in">Hi, {visitorName} 💗</span>
          <form action="/api/logout" method="post"><button className="btn secondary">Log out</button></form>
        </div>
      </div>

      <section className="hero">
        <div className="card">
          <div style={{fontSize:'3rem'}}>💗</div>
          <h1>My Dearest <span className="pink">Joy</span></h1>
          <p className="lead">This little corner of the internet belongs to only two people: you and me. A private place for our memories, our jokes, our pictures, and everything beautiful we keep building together.</p>

          <DaysTogether />

          <div className="grid">
            <div className="mini"><h2>How we began</h2><p className="muted">June 7th at 9:00 PM — the exact moment our clock started. 💞</p></div>
            <div className="mini"><h2>What you are to me</h2><p className="muted">My peace, my happiness, and the person who makes ordinary days feel special.</p></div>
            <div className="mini"><h2>Our little world</h2><p className="muted">Live moods, notes, countdowns, kisses, memories and all the tiny things that make this ours.</p></div>
          </div>
          <p className="lead pink"><strong>I choose you, every single time.</strong></p>
        </div>
      </section>

      <LoveList />
      <Wishlist user={user} />
      <LoveExtras user={user} />
      <CoupleLive user={user} />

      <footer className="footer">Made with love by Ozioma, only for Joy ❤️</footer>
    </main>
  );
}
