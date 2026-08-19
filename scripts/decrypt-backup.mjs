// Descriptografa um snapshot gerado por app/api/internal/backup/route.ts —
// use só numa emergência de restauração (o Neon zerando de novo, por
// exemplo). Não reinsere nada sozinho: só imprime o JSON decifrado, pra
// inspecionar ou escrever num script de reinserção à parte.
//
// Uso: BACKUP_ENCRYPTION_KEY=... node scripts/decrypt-backup.mjs caminho/do/arquivo.enc
import { readFileSync } from "node:fs";
import { createDecipheriv } from "node:crypto";

const key = process.env.BACKUP_ENCRYPTION_KEY;
const filePath = process.argv[2];
if (!key || !filePath) {
  console.error("Uso: BACKUP_ENCRYPTION_KEY=... node scripts/decrypt-backup.mjs caminho/do/arquivo.enc");
  process.exit(1);
}

const data = readFileSync(filePath);
const iv = data.subarray(0, 12);
const authTag = data.subarray(12, 28);
const ciphertext = data.subarray(28);

const decipher = createDecipheriv("aes-256-gcm", Buffer.from(key, "base64"), iv);
decipher.setAuthTag(authTag);
const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

console.log(plaintext);
