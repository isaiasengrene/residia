/**
 * PRUEBA CRÍTICA DE AISLAMIENTO DE TENANT
 *
 * Verifica que el mecanismo de search_path de PostgreSQL aísla correctamente
 * los datos entre distintos centros (tenants).
 *
 * Si esta prueba falla → NO desplegar.
 *
 * Uso: npm run test:isolation
 */

import { Client } from 'pg';

const DB_HOST     = process.env['DB_HOST']     ?? 'localhost';
const DB_PORT     = parseInt(process.env['DB_PORT'] ?? '5432', 10);
const DB_USER     = process.env['DB_USER']     ?? 'residia';
const DB_PASSWORD = process.env['DB_PASSWORD'] ?? 'residia_dev';
const DB_NAME     = process.env['DB_NAME']     ?? 'residia';

const SCHEMA_A = 'test_centro_a';
const SCHEMA_B = 'test_centro_b';

describe('Aislamiento de tenant (search_path)', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });
    await client.connect();

    // Crear los dos esquemas de prueba limpios
    await client.query(`DROP SCHEMA IF EXISTS ${SCHEMA_A} CASCADE`);
    await client.query(`DROP SCHEMA IF EXISTS ${SCHEMA_B} CASCADE`);
    await client.query(`CREATE SCHEMA ${SCHEMA_A}`);
    await client.query(`CREATE SCHEMA ${SCHEMA_B}`);

    // Crear tabla residentes en ambos esquemas
    for (const schema of [SCHEMA_A, SCHEMA_B]) {
      await client.query(`
        CREATE TABLE ${schema}.residentes (
          id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre TEXT NOT NULL,
          activo BOOLEAN NOT NULL DEFAULT TRUE
        )
      `);
    }

    // Insertar un residente SOLO en el schema A
    await client.query(
      `INSERT INTO ${SCHEMA_A}.residentes (nombre) VALUES ($1)`,
      ['Ana García'],
    );
  });

  afterAll(async () => {
    // Limpieza obligatoria
    await client.query(`DROP SCHEMA IF EXISTS ${SCHEMA_A} CASCADE`);
    await client.query(`DROP SCHEMA IF EXISTS ${SCHEMA_B} CASCADE`);
    await client.end();
  });

  it('el schema B no debe ver residentes del schema A', async () => {
    // Establecer search_path al schema B
    await client.query(`SET search_path TO ${SCHEMA_B}, public`);

    const { rows } = await client.query(`SELECT * FROM residentes`);

    expect(rows).toHaveLength(0);
  });

  it('el schema A debe ver su propio residente', async () => {
    // Establecer search_path al schema A
    await client.query(`SET search_path TO ${SCHEMA_A}, public`);

    const { rows } = await client.query(`SELECT * FROM residentes`);

    expect(rows).toHaveLength(1);
    expect((rows[0] as { nombre: string }).nombre).toBe('Ana García');
  });

  it('una inserción en B no aparece en A', async () => {
    // Insertar en B con search_path a B
    await client.query(`SET search_path TO ${SCHEMA_B}, public`);
    await client.query(
      `INSERT INTO residentes (nombre) VALUES ($1)`,
      ['Carlos López'],
    );

    // Cambiar a A y verificar que A sigue con solo su residente
    await client.query(`SET search_path TO ${SCHEMA_A}, public`);
    const { rows } = await client.query(`SELECT * FROM residentes`);

    expect(rows).toHaveLength(1);
    expect((rows[0] as { nombre: string }).nombre).toBe('Ana García');
  });

  it('search_path a B ve solo el residente de B', async () => {
    await client.query(`SET search_path TO ${SCHEMA_B}, public`);
    const { rows } = await client.query(`SELECT * FROM residentes`);

    expect(rows).toHaveLength(1);
    expect((rows[0] as { nombre: string }).nombre).toBe('Carlos López');
  });
});
