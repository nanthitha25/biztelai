import os
import pandas as pd
from typing import List

DB_PATH = "database.csv"

def save_records_to_db(records_df: pd.DataFrame) -> None:
    """Appends a validated DataFrame batch to the local CSV database."""
    if os.path.exists(DB_PATH):
        try:
            existing_db = pd.read_csv(DB_PATH)
            # Combine old data and new approved data batches
            updated_db = pd.concat([existing_db, records_df], ignore_index=True)
        except Exception:
            updated_db = records_df
    else:
        updated_db = records_df
        
    updated_db.to_csv(DB_PATH, index=False)

def load_db_records() -> pd.DataFrame:
    """Loads all historical processed data records. Raises FileNotFoundError if empty."""
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError("No historical operational logs stored yet.")
    return pd.read_csv(DB_PATH)
