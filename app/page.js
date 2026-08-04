export default function Home() {
  return (
    <main className="shell">
      <div className="topbar">
        <strong>Ozioma × Joy ❤️</strong>
        <form action="/api/logout" method="post"><button className="btn secondary">Log out</button></form>
      </div>

      <section className="hero">
        <div className="card">
          <div style={{fontSize:'3rem'}}>💗</div>
          <h1>My Dearest <span className="pink">Joy</span></h1>
          <p className="lead">This little corner of the internet belongs to only two people: you and me. A private place for our memories, our jokes, our pictures, and everything beautiful we keep building together.</p>
          <div className="grid">
            <div className="mini"><h2>How we began</h2><p className="muted">June 3rd — the day everything changed for the better.</p></div>
            <div className="mini"><h2>What you are to me</h2><p className="muted">My peace, my happiness, and the person who makes ordinary days feel special.</p></div>
            <div className="mini"><h2>Our little world</h2><p className="muted">Photos, letters, music, countdowns and surprises will live here.</p></div>
          </div>
          <p className="lead pink"><strong>I choose you, every single time.</strong></p>
        </div>
      </section>
      <footer className="footer">Made with love by Ozioma, only for Joy ❤️</footer>
    </main>
  );
}
