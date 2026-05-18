require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // necesario para Supabase
});

client.connect()
  .then(() => {
    console.log('✅ Conectado a Supabase');
    return client.query('SELECT NOW() as hora');
  })
  .then(res => console.log('Hora del servidor:', res.rows[0].hora))
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => client.end());