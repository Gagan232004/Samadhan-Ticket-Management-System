import { Client } from 'pg';

const client = new Client({
  connectionString: "postgresql://postgres:Dahanu%40209@localhost:5432/ticket_management_test?schema=public"
});

async function checkTables() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log("Tables in ticket_management_test public schema:", res.rows);
  await client.end();
}

checkTables().catch(console.error);
