import { Database } from "bun:sqlite";
import path from "path";

const dbPath = path.join(process.cwd(), "mydb.sqlite");
const db = new Database(dbPath);

try {
  const configs = db.query("SELECT * FROM configuracoes_whatsapp").all();
  console.log("WhatsApp Configs:", JSON.stringify(configs, null, 2));
} catch (e) {
  console.error("Error reading DB:", e);
} finally {
  db.close();
}
