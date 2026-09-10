import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId) {
  console.error("Missing Firebase env vars. Make sure VITE_FIREBASE_* are set.");
  process.exit(1);
}

const app = initializeApp(config);
const db = getFirestore(app);

const habits = [
  { name: "Drink water", emoji: "💧", accent: "brand", position: 1 },
  { name: "Read 20 pages", emoji: "📖", accent: "accent", position: 2 },
  { name: "Morning run", emoji: "🏃", accent: "teal", position: 3 },
];

const notes = [
  { category: "Idea", content: "Sketch the onboarding flow for the streak celebration — confetti on day 30?" },
  { category: "Reading", content: 'Finish chapter 4 of "Field Guide to Calm" before the weekend walk.' },
  { category: "List", content: "Call the podiatrist, water the fiddle-leaf, draft the Q3 retro doc." },
];

async function seed() {
  console.log("Seeding habits...");
  for (const h of habits) {
    const ref = await addDoc(collection(db, "habits"), h);
    console.log(`  ✓ habit: ${h.name} (${ref.id})`);
  }

  console.log("Seeding notes...");
  for (const n of notes) {
    const ref = await addDoc(collection(db, "notes"), {
      ...n,
      created_at: serverTimestamp(),
    });
    console.log(`  ✓ note: ${n.category} (${ref.id})`);
  }

  console.log("\nDone! 3 habits and 3 notes added to Firestore.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
