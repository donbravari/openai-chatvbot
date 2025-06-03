import { OpenAI } from 'openai';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Eres un experto en productos espirituales. Responde con una categoría como: limpieza energética, amor propio, protección, conexión espiritual.' },
      { role: 'user', content: message }
    ],
    model: 'gpt-4'
  });

  const category = completion.choices[0].message.content.toLowerCase().trim();

  const products = await axios.get(`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products.json?tag=${category}`, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
    }
  });

  const formatted = products.data.products.map(p => ({
    title: p.title,
    image: p.image?.src,
    link: `https://${process.env.SHOPIFY_STORE_DOMAIN}/products/${p.handle}`
  }));

  res.status(200).json({ category, recommendations: formatted });
}
