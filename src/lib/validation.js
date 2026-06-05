export function validateRecords(records) {
  return records.map(record => {
    const errors = [];
    
    const isRowCompletelyEmpty = 
      !String(record.date || '').trim() && 
      !String(record.shift || '').trim() && 
      !String(record.empNo || '').trim() && 
      !String(record.opnCode || '').trim() && 
      !String(record.machineNo || '').trim() && 
      !String(record.workOrderNo || '').trim() &&
      !String(record.qtyProd || '').trim() &&
      !String(record.timeTaken || '').trim();

    if (isRowCompletelyEmpty) {
      return {
        ...record,
        validationErrors: []
      };
    }

    // Shift validation
    const shift = String(record.shift || '').trim();
    if (shift && !['1', '2', '3', 'I', 'II', 'III'].includes(shift)) {
      errors.push('Invalid shift');
    }

    // Emp No pattern
    const empNo = String(record.empNo || '').trim();
    if (empNo && !empNo.startsWith('BT')) {
      errors.push('Invalid Emp No format (should start with BT)');
    }

    // Machine No pattern
    const machineNo = String(record.machineNo || '').trim();
    if (machineNo && !machineNo.toLowerCase().startsWith('mc-')) {
      errors.push('Invalid Machine No format (should start with MC-)');
    }

    // Quantity validation
    const qty = String(record.qtyProd || '').trim();
    if (!qty) {
      errors.push('Empty quantity');
    } else if (isNaN(Number(qty))) {
      errors.push('Suspicious numeric value for quantity');
    }

    // Time taken
    const timeTaken = Number(record.timeTaken);
    if (!isNaN(timeTaken) && timeTaken > 12) {
      errors.push('Time taken > 12 hrs');
    }

    // Missing mandatory fields
    const mandatoryFields = ['date', 'opnCode', 'workOrderNo'];
    mandatoryFields.forEach(field => {
      if (!record[field] || String(record[field]).trim() === '') {
        errors.push(`Missing ${field}`);
      }
    });

    return {
      ...record,
      validationErrors: errors
    };
  });
}
