"""
UUID compatibility module for SQLite and PostgreSQL
"""
import uuid
from sqlalchemy import TypeDecorator, String
from sqlalchemy.dialects import postgresql, sqlite


class GUID(TypeDecorator):
    """
    Platform-independent GUID type.
    
    Uses PostgreSQL's UUID type, otherwise uses String(36) for SQLite.
    """
    impl = String
    cache_ok = True

    def __init__(self, as_uuid=True, **kwargs):
        # Store the as_uuid parameter for later use
        self.as_uuid = as_uuid
        super().__init__(**kwargs)

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(postgresql.UUID(as_uuid=self.as_uuid))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
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

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value


def setup_uuid_compatibility():
    """
    Set up UUID compatibility for testing.
    This replaces PostgreSQL's UUID type with our GUID type.
    """
    # Replace PostgreSQL UUID with our GUID type
    postgresql.UUID = GUID
    
    # Add visit_UUID method to SQLite type compiler
    from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler
    
    def visit_UUID(self, type_, **kw):
        return "TEXT"
    
    SQLiteTypeCompiler.visit_UUID = visit_UUID
