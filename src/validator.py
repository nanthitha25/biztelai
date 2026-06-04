import re
from typing import List

def validate_records(records: List[dict]) -> List[dict]:
    validated_records = []
    
    for row in records:
        flags = []
        
        # Rule 1: Validate machine format (MC-XXX)
        if not re.match(r"^MC-\d+$", str(row["machine_number"])):
            flags.append("Invalid Machine Format")
            
        # Rule 2: Flag missing critical entries
        if not row["employee_number"] or str(row["employee_number"]).strip() == "":
            flags.append("Missing Employee Number")
            
        # Rule 3: Flag suspicious/unrealistic operational timelines
        if row["time_taken_hours"] > 12.0:
            flags.append("Suspiciously Long Hours (>12h)")
        if row["time_taken_hours"] <= 0:
            flags.append("Invalid Hours Duration")
            
        # Rule 4: Suspicious Production Quantities
        if row["quantity_produced"] is None or row["quantity_produced"] <= 0:
            flags.append("Empty/Invalid Quantity")

        row["validation_flags"] = ", ".join(flags) if flags else "Passed"
        row["requires_review"] = len(flags) > 0
        validated_records.append(row)
        
    return validated_records
