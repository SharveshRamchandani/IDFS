# Move IDFS Backend Data to Neon

This repo is already running against PostgreSQL locally through `backend/.env`, so the migration to Neon is a PostgreSQL-to-PostgreSQL move.

As of April 1, 2026, Neon publicly documents support for PostgreSQL 14, 15, 16, and 17. If you specifically want PostgreSQL 18, you will need to wait until Neon exposes it.

## 1. Create the Neon database

Create a Neon project and copy the primary connection string. Use the full connection string including:

```env
sslmode=require
```

Example:

```env
postgresql://neondb_owner:password@ep-your-project.region.aws.neon.tech/neondb?sslmode=require
```

## 2. Back up the current database

The safest path is still to take a dump before doing anything else:

```bash
pg_dump "postgresql://postgres:root@localhost:5432/IDFS_DB" > idfs_backup.sql
```

## 3. Run the repo migration helper

From the `backend` directory:

```bash
python migrate_to_neon.py --source-db-url "postgresql://postgres:root@localhost:5432/IDFS_DB" --target-db-url "postgresql://neondb_owner:password@ep-your-project.region.aws.neon.tech/neondb?sslmode=require" --truncate-target
```

What it does:

- creates any missing tables in the Neon database from your SQLAlchemy models
- copies data table by table
- optionally truncates the target first
- resets integer ID sequences after the copy

## 4. Verify counts

Compare a few important tables after migration:

- `user`
- `product`
- `store`
- `storeinventory`
- `salesdata`
- `supplier`
- `purchaseorder`
- `shipment`
- `forecast`
- `holiday`

You can also point `DATABASE_URL` to Neon temporarily and run:

```bash
python check_db_counts.py
```

## 5. Switch Render to Neon

In Render, update the backend environment variables:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-your-project.region.aws.neon.tech/neondb?sslmode=require
SECRET_KEY=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
GOOGLE_CLIENT_ID=your-google-client-id
ENABLE_LIVE_SIMULATOR=false
```

Use this Render start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 6. Deploy order

1. Create and verify Neon.
2. Migrate data into Neon.
3. Update Render `DATABASE_URL`.
4. Redeploy backend.
5. Test login, dashboard, inventory, and forecasting endpoints.

## Notes

- Keep the old Postgres database until production traffic has been validated against Neon.
- If your source data changes during migration, freeze writes briefly or rerun the migration just before cutover.
- This repo auto-creates tables at startup, but it does not have full Alembic-managed migrations in place, so take a backup before every production cutover.
