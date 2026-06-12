"""Conexión a PostgreSQL con soporte schema-per-tenant."""
import asyncpg
import os
from contextlib import asynccontextmanager


_pool = None


async def obtener_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(os.environ["DATABASE_URL"], min_size=2, max_size=10)
    return _pool


@asynccontextmanager
async def conexion_tenant(centro_slug: str):
    """Context manager que configura search_path para el centro indicado."""
    pool = await obtener_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            f'SET search_path TO "centro_{centro_slug}", shared, public'
        )
        yield conn
