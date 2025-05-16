// importRemedies.js
import { createRequire } from "module";
import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import JSON using CommonJS-style require
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importRemedies() {
  const dataPath = path.join(__dirname, "remedies.json");
  const fileData = await readFile(dataPath, "utf-8");
  const remedies = JSON.parse(fileData);

  for (const remedy of remedies) {
    const docRef = db.collection("recipes").doc(); // auto-generated ID
    await docRef.set(remedy);
    console.log(`Imported: ${remedy.name}`);
  }

  console.log("✅ All remedies imported.");
}

importRemedies().catch(console.error);
