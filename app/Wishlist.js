'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Wishlist.module.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image.'));
    if (file.size > MAX_FILE_SIZE) return reject(new Error('That image is too large. Keep it under 5 MB.'));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Could not open that image.'));
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Wishlist({ user }) {
  const isJoy = user === 'joy';
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  const loadWishlist = async () => {
    try {
      const response = await fetch('/api/couple-state', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setItems(Array.isArray(data.state?.wishlist) ? data.state.wishlist : []);
    } catch {
      // Keep the section usable even if sync is briefly unavailable.
    }
  };

  useEffect(() => {
    loadWishlist();
    const timer = setInterval(loadWishlist, 7000);
    return () => clearInterval(timer);
  }, []);

  const pickImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('Preparing screenshot…');
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      setMessage('Screenshot ready 💗');
    } catch (error) {
      setImage('');
      setMessage(error.message || 'Could not use that image.');
    }
  };

  const addItem = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setMessage('Tell me what the item is first 😭');
      return;
    }

    setBusy(true);
    setMessage('Saving wishlist item…');
    try {
      const response = await fetch('/api/couple-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'wishlist-add',
          item: { title, price, link, note, image },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save it.');
      setItems(Array.isArray(data.state?.wishlist) ? data.state.wishlist : []);
      setTitle('');
      setPrice('');
      setLink('');
      setNote('');
      setImage('');
      if (fileRef.current) fileRef.current.value = '';
      setMessage('Added to your wishlist 😝💗');
    } catch (error) {
      setMessage(error.message || 'Could not save it.');
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (id) => {
    setBusy(true);
    try {
      const response = await fetch('/api/couple-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'wishlist-remove', id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not remove it.');
      setItems(Array.isArray(data.state?.wishlist) ? data.state.wishlist : []);
      setMessage('Removed from wishlist.');
    } catch (error) {
      setMessage(error.message || 'Could not remove it.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>JOY'S WISHLIST 🎀</span>
        <h2>Things my girl wants 😭💗</h2>
        <p>{isJoy ? 'Drop it here so your man can see exactly what you mean.' : 'No guessing games. She can attach the exact screenshot here 😭'}</p>
      </div>

      {isJoy && (
        <form className={styles.form} onSubmit={addItem}>
          <div className={styles.fields}>
            <label>
              Item name
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="e.g. Black handbag" />
            </label>
            <label>
              Price (optional)
              <input value={price} onChange={(e) => setPrice(e.target.value)} maxLength={30} placeholder="e.g. ₦18,500" />
            </label>
            <label className={styles.full}>
              Link (optional)
              <input value={link} onChange={(e) => setLink(e.target.value)} maxLength={500} placeholder="Paste the product link if you have it" />
            </label>
            <label className={styles.full}>
              Little note (optional)
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={160} placeholder="Colour, size, where you saw it, anything he should know…" />
            </label>
          </div>

          <div className={styles.uploadWrap}>
            <input ref={fileRef} className={styles.fileInput} type="file" accept="image/*" onChange={pickImage} />
            <button className={styles.uploadButton} type="button" onClick={() => fileRef.current?.click()}>
              {image ? '📸 Change screenshot' : '📎 Attach screenshot'}
            </button>
            <span>JPG/PNG • up to 5 MB</span>
          </div>

          {image && (
            <div className={styles.preview}>
              <img src={image} alt="Wishlist screenshot preview" />
              <button type="button" onClick={() => { setImage(''); if (fileRef.current) fileRef.current.value = ''; }}>Remove image</button>
            </div>
          )}

          <div className={styles.formFooter}>
            <span>{message}</span>
            <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Add to wishlist 💗'}</button>
          </div>
        </form>
      )}

      {!isJoy && message && <p className={styles.message}>{message}</p>}

      <div className={styles.grid}>
        {items.length === 0 ? (
          <div className={styles.empty}>Nothing here yet. Joy can add the first item whenever she wants 🎀</div>
        ) : items.map((item) => (
          <article className={styles.card} key={item.id}>
            {item.image ? <img className={styles.itemImage} src={item.image} alt={`${item.title} wishlist screenshot`} /> : <div className={styles.noImage}>🎁</div>}
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <h3>{item.title}</h3>
                {item.price && <span className={styles.price}>{item.price}</span>}
              </div>
              {item.note && <p>{item.note}</p>}
              <div className={styles.actions}>
                {item.link && <a href={item.link} target="_blank" rel="noreferrer">Open item ↗</a>}
                {isJoy && <button type="button" disabled={busy} onClick={() => removeItem(item.id)}>Remove</button>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
