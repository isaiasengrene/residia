/**
 * Script de datos iniciales para ResidIA.
 * Crea un usuario de prueba en shared.usuarios para desarrollo.
 *
 * Uso: npm run seed
 */

import { Client } from 'pg';
import * as argon2 from 'argon2';

const DB_HOST     = process.env['DB_HOST']     ?? 'localhost';
const DB_PORT     = parseInt(process.env['DB_PORT'] ?? '5432', 10);
const DB_USER     = process.env['DB_USER']     ?? 'residia';
const DB_PASSWORD = process.env['DB_PASSWORD'] ?? 'residia_dev';
const DB_NAME     = process.env['DB_NAME']     ?? 'residia';

const EMAIL_SEED      = 'laura@ozanam.es';
const PASSWORD_SEED   = 'ResidIA2024!';
const TOTP_SECRET     = 'JBSWY3DPEHPK3PXP'; // Fijo para desarrollo con Google Authenticator

async function ejecutarSeed(): Promise<void> {
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await client.connect();
  console.log(`Conectado a la base de datos: ${DB_NAME}@${DB_HOST}:${DB_PORT}`);

  try {
    // Verificar si el usuario ya existe
    const { rows: existentes } = await client.query(
      `SELECT id FROM shared.usuarios WHERE email = $1`,
      [EMAIL_SEED],
    );

    if (existentes.length > 0) {
      console.log(`El usuario seed ya existe: ${EMAIL_SEED} — no se realizan cambios.`);
      return;
    }

    // Añadir columnas si no existen (patrón idempotente)
    await client.query(`
      ALTER TABLE shared.usuarios
        ADD COLUMN IF NOT EXISTS totp_secret TEXT,
        ADD COLUMN IF NOT EXISTS centro_slug TEXT
    `);
    console.log('Columnas totp_secret y centro_slug verificadas.');

    // Hashear la contraseña con argon2
    const passwordHash = await argon2.hash(PASSWORD_SEED);

    // Insertar el usuario de prueba
    const { rows } = await client.query(
      `INSERT INTO shared.usuarios
         (email, password_hash, nombre, apellidos, perfil, centro_slug, totp_secret, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, perfil`,
      [
        EMAIL_SEED,
        passwordHash,
        'Laura',
        'Beltrán',
        'COORDINADOR',
        'ozanam',
        TOTP_SECRET,
        true,
      ],
    );

    const usuario = rows[0] as { id: string; email: string; perfil: string };
    console.log(`Usuario seed creado: ${usuario.email} (ID: ${usuario.id}, perfil: ${usuario.perfil})`);
    console.log(`  Contraseña: ${PASSWORD_SEED}`);
    console.log(`  TOTP secret: ${TOTP_SECRET} (compatible con Google Authenticator)`);
    console.log(`  Centro: ozanam`);
  } finally {
    await client.end();
    console.log('Conexión cerrada.');
  }
}

ejecutarSeed().catch((err: unknown) => {
  console.error('Error durante el seed:', err);
  process.exit(1);
});
