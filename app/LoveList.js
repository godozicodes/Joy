import styles from './LoveList.module.css';

const things = [
  { icon: '👀', text: 'Your eyes' },
  { icon: '😊', text: 'Your pretty smile' },
  { icon: '🎙️', text: 'Damn... I love your accent frr' },
  { icon: '🧠', text: 'Your intellect' },
  { icon: '🙈', text: 'Your titties 🙈' },
  { icon: '😮‍💨', text: 'Your sexy shape' },
  { icon: '📏', text: 'Your height' },
  { icon: '❄️', text: 'Snow & Ice!!' },
];

export default function LoveList() {
  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>JUST SO YOU NEVER FORGET</span>
        <h2>Things I love about my girl 💗</h2>
        <p>Yeah, I notice all of it. Every single bit. 😭</p>
      </div>

      <div className={styles.grid}>
        {things.map((thing, index) => (
          <article className={styles.item} key={thing.text}>
            <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.icon} aria-hidden="true">{thing.icon}</span>
            <strong>{thing.text}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
