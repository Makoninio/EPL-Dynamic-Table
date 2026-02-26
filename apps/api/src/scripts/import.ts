import { promises as fs } from 'node:fs';

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: tsx src/scripts/import.ts <path-to-json-or-csv>');
    process.exit(1);
  }

  const body = await fs.readFile(path, 'utf8');
  console.log(`Loaded ${path} (${body.length} bytes).`);
  console.log('TODO: parse and upsert season/team/match/standings data into Prisma models.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
