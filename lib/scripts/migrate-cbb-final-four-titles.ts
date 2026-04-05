import { config } from 'dotenv';
import { resolve } from 'path';
import type { Prediction } from '@/lib/models/prediction';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const TITLE_MAP: Record<string, string> = {
  'Final Four 1': '372609',
  'Final Four 2': '372608',
};

async function main() {
  const { getDatabase } = await import('../mongodb');
  const db = await getDatabase();
  const coll = db.collection<Prediction>('predictions');

  const cursor = coll.find({ sport: 'cbb' });
  let updated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    if (!doc.bracket?.semifinals?.length) {
      skipped++;
      continue;
    }
    const nextSf = doc.bracket.semifinals.map((g) => {
      const t = g.title;
      const replacement = t != null ? TITLE_MAP[t] : undefined;
      return replacement ? { ...g, title: replacement } : g;
    });
    const changed = nextSf.some(
      (g, i) => g.title !== doc.bracket.semifinals[i].title
    );
    if (!changed) {
      skipped++;
      continue;
    }
    await coll.updateOne(
      { _id: doc._id },
      {
        $set: {
          'bracket.semifinals': nextSf,
          updatedAt: new Date(),
        },
      }
    );
    updated++;
  }

  console.log(`Done. Updated ${updated} prediction(s), skipped ${skipped} (no change or empty semifinals).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
