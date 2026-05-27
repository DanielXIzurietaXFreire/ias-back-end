const { Client } = require('pg');

async function main() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error('DATABASE_URL not provided');
      process.exit(2);
    }

    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await client.connect();
    console.log('PG_OK');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('PG_ERROR', err);
    process.exit(1);
  }
}

main();
