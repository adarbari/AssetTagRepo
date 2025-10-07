"""
UUID compatibility module for SQLite and PostgreSQL
"""

import uuid

from sqlalchemy import String, TypeDecorator
from sqlalchemy.dialects import postgresql, sqlite


class GUID(TypeDecorator):
    """
    Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses String(36) for SQLite.
    """

    impl = String
    cache_ok = True

    def __init__(self, as_uuid=True, **kwargs) -> None:
        # Store the as_uuid parameter for later use
        self.as_uuid = as_uuid
        super().__init__(**kwargs)

    def load_dialect_impl(self, dialect) -> None:
        if dialect.name == "postgresql":
            # Create a new UUID type without triggering recursion
            uuid_type = postgresql.UUID()
            uuid_type.as_uuid = self.as_uuid
            return uuid_type
        else:
            return String(36)

    def process_bind_param(self, value, dialect) -> None:
        if value is None:
            return value
        elif dialect.name == "postgresql":
            if isinstance(value, uuid.UUID):
                return value
            else:
                return uuid.UUID(str(value))
        else:
            # For SQLite, store as string
            if isinstance(value, uuid.UUID):
                return str(value)
            else:
                return str(value)

    def process_result_value(self, value, dialect) -> None:
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value


def setup_uuid_compatibility() -> None:
    """
    Set up UUID compatibility for testing.
    This adds SQLite support for UUID types.
    """
    # Add visit_UUID method to SQLite type compiler
    from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler

    def visit_UUID(self, type_, **kw) -> None:
        return "TEXT"

    SQLiteTypeCompiler.visit_UUID = visit_UUID
