import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]);

  async function send() {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setResults(data.recommendations);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Chatbot Espiritual de Artefolk</h1>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="¿Qué necesitas hoy espiritualmente?"
        style={{ width: '300px', padding: '0.5rem' }}
      />
      <button onClick={send} style={{ marginLeft: '1rem', padding: '0.5rem' }}>Enviar</button>
      <div style={{ marginTop: '2rem' }}>
        {results.map((p, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <img src={p.image} width="100" alt={p.title} />
            <p><a href={p.link} target="_blank" rel="noopener noreferrer">{p.title}</a></p>
          </div>
        ))}
      </div>
    </div>
  );
}
