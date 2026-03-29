import { config } from 'dotenv';
import { resolve } from 'path';
import type { Prediction } from '@/lib/models/prediction';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const TITLE_MAP: Record<string, string> = {
  'e8-1': 'East Region',
  'e8-2': 'South Region',
  'e8-3': 'Midwest Region',
  'e8-4': 'West Region',
  // Legacy titles from cbbUiSnapshotToStoredBracket (same slot order as e8-*)
  'Elite Eight 1': 'East Region',
  'Elite Eight 2': 'South Region',
  'Elite Eight 3': 'Midwest Region',
  'Elite Eight 4': 'West Region',
};

async function main() {
  const { getDatabase } = await import('../mongodb');
  const db = await getDatabase();
  const coll = db.collection<Prediction>('predictions');

  const cursor = coll.find({ sport: 'cbb' });
  let updated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    if (!doc.bracket?.quarterfinals?.length) {
      skipped++;
      continue;
    }
    const nextQf = doc.bracket.quarterfinals.map((g) => {
      const t = g.title;
      const replacement = t != null ? TITLE_MAP[t] : undefined;
      return replacement ? { ...g, title: replacement } : g;
    });
    const changed = nextQf.some(
      (g, i) => g.title !== doc.bracket.quarterfinals[i].title
    );
    if (!changed) {
      skipped++;
      continue;
    }
    await coll.updateOne(
      { _id: doc._id },
      {
        $set: {
          'bracket.quarterfinals': nextQf,
          updatedAt: new Date(),
        },
      }
    );
    updated++;
  }

  console.log(`Done. Updated ${updated} prediction(s), skipped ${skipped} (no change or empty quarterfinals).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
