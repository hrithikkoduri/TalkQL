from langchain_community.utilities import SQLDatabase
from typing import Optional

class DatabaseConnection:
    def __init__(self):
        self._db: Optional[SQLDatabase] = None
    
    def connect(self, connection_uri: str) -> bool:
        """Connect to any SQL database using connection URI"""
        try:
            self._db = SQLDatabase.from_uri(connection_uri)
            return True
        except Exception as e:
            raise Exception(f"Failed to connect to database: {str(e)}")
    
    @property
    def db(self) -> SQLDatabase:
        if not self._db:
            raise Exception("Database not connected. Call connect() first.")
        return self._db

# Global database instance
db_connection = DatabaseConnection()