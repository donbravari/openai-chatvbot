import { OpenAI } from 'openai';
import axios from 'axios';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://artefolk-mistica-shop.myshopify.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  try {
    const { message } = req.body;
  
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
  }  catch (err) {
    res.status(500).json({ error: 'Error en recomendación.' });
  }
}
