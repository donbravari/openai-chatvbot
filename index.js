const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/recommend', async (req, res) => {
  const userMessage = req.body.message;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Eres un experto en productos espirituales. Responde con una categoría como: limpieza energética, amor propio, protección, conexión espiritual.' },
      { role: 'user', content: userMessage }
    ],
    model: 'gpt-4',
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

  res.json({ category, recommendations: formatted });
});

app.listen(3000, () => console.log('Bot listening on port 3000'));
