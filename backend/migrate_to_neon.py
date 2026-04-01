import argparse
import os
from typing import Iterable, List

from sqlalchemy import MetaData, create_engine, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from app.db.base_class import Base


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy the current IDFS PostgreSQL database into a Neon PostgreSQL database."
    )
    parser.add_argument(
        "--source-db-url",
        default=os.getenv("DATABASE_URL"),
        help="Source PostgreSQL connection string. Defaults to DATABASE_URL.",
    )
    parser.add_argument(
        "--target-db-url",
        default=os.getenv("TARGET_DATABASE_URL") or os.getenv("NEON_DATABASE_URL"),
        help="Target PostgreSQL connection string. Defaults to TARGET_DATABASE_URL or NEON_DATABASE_URL.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=1000,
        help="Number of rows to insert per batch.",
    )
    parser.add_argument(
        "--truncate-target",
        action="store_true",
        help="Truncate target tables before copying data.",
    )
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    if not args.source_db_url:
        raise ValueError("Missing source database URL. Set DATABASE_URL or pass --source-db-url.")
    if not args.target_db_url:
        raise ValueError(
            "Missing target database URL. Set TARGET_DATABASE_URL/NEON_DATABASE_URL or pass --target-db-url."
        )
    if not args.source_db_url.startswith("postgresql"):
        raise ValueError("Source database must be PostgreSQL.")
    if not args.target_db_url.startswith("postgresql"):
        raise ValueError("Target database must be PostgreSQL.")
    if "neon.tech" in args.target_db_url and "sslmode=require" not in args.target_db_url:
        raise ValueError("Neon connection strings should include sslmode=require.")


def build_engine(url: str) -> Engine:
    return create_engine(url, future=True)


def load_target_schema(target_engine: Engine) -> None:
    # Import models so SQLAlchemy knows every table before create_all runs.
    from app.models import Forecast, Holiday, Product, PurchaseOrder, SalesData, Shipment, Store, StoreInventory, Supplier, User  # noqa: F401

    Base.metadata.create_all(bind=target_engine)


def reflect_metadata(engine: Engine) -> MetaData:
    metadata = MetaData()
    metadata.reflect(bind=engine)
    return metadata


def ordered_table_names(metadata: MetaData) -> List[str]:
    return [table.name for table in metadata.sorted_tables]


def chunked(rows: Iterable[dict], size: int) -> Iterable[List[dict]]:
    batch: List[dict] = []
    for row in rows:
        batch.append(row)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch


def truncate_target_tables(target_engine: Engine, table_names: List[str]) -> None:
    if not table_names:
        return
    joined = ", ".join(f'"{name}"' for name in reversed(table_names))
    with target_engine.begin() as conn:
        conn.execute(text(f"TRUNCATE TABLE {joined} RESTART IDENTITY CASCADE"))


def copy_table_data(source_engine: Engine, target_engine: Engine, table_name: str, batch_size: int) -> int:
    source_metadata = reflect_metadata(source_engine)
    target_metadata = reflect_metadata(target_engine)

    source_table = source_metadata.tables.get(table_name)
    target_table = target_metadata.tables.get(table_name)
    if source_table is None or target_table is None:
        return 0

    copied = 0
    with source_engine.connect() as source_conn:
        result = source_conn.execute(select(source_table)).mappings()
        for batch in chunked((dict(row) for row in result), batch_size):
            with target_engine.begin() as target_conn:
                target_conn.execute(target_table.insert(), batch)
            copied += len(batch)

    return copied


def reset_sequences(target_engine: Engine, metadata: MetaData) -> None:
    statements = []
    for table in metadata.sorted_tables:
        if "id" not in table.columns:
            continue
        statements.append(
            text(
                """
                SELECT setval(
                    pg_get_serial_sequence(:table_name, 'id'),
                    COALESCE((SELECT MAX(id) FROM "{}"), 1),
                    COALESCE((SELECT MAX(id) FROM "{}"), 0) > 0
                )
                """.format(table.name, table.name)
            ).bindparams(table_name=table.name)
        )

    with target_engine.begin() as conn:
        for statement in statements:
            conn.execute(statement)


def row_count(engine: Engine, table_name: str) -> int:
    with engine.connect() as conn:
        return conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).scalar_one()


def main() -> None:
    args = parse_args()
    validate_args(args)

    source_engine = build_engine(args.source_db_url)
    target_engine = build_engine(args.target_db_url)

    try:
        load_target_schema(target_engine)

        source_metadata = reflect_metadata(source_engine)
        target_metadata = reflect_metadata(target_engine)
        table_names = [name for name in ordered_table_names(source_metadata) if name in target_metadata.tables]

        if args.truncate_target:
            truncate_target_tables(target_engine, table_names)

        print("Starting PostgreSQL to Neon copy...")
        for table_name in table_names:
            copied = copy_table_data(source_engine, target_engine, table_name, args.batch_size)
            source_total = row_count(source_engine, table_name)
            target_total = row_count(target_engine, table_name)
            print(
                f"{table_name}: copied {copied} rows | source={source_total} | target={target_total}"
            )

        reset_sequences(target_engine, target_metadata)
        print("Migration completed successfully.")
    except SQLAlchemyError as exc:
        raise SystemExit(f"Migration failed: {exc}") from exc


if __name__ == "__main__":
    main()
