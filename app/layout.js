import './globals.css';
import './love-extras.css';
import './romance-ui.css';

export const metadata = {
  title: 'For Joy ❤️',
  description: 'A private love website for Joy and Ozioma',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
