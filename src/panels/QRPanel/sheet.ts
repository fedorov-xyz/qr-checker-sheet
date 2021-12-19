import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function parseSheet(spreadsheet: GoogleSpreadsheet) {
  const sheetAllowed = spreadsheet.sheetsByIndex[0];
  const sheetDone = spreadsheet.sheetsByIndex[1];

  await Promise.all([sheetAllowed.loadCells(), sheetDone.loadCells()]);

  const allowed: string[] = [];
  for (let i = 0; i < sheetAllowed.rowCount; i++) {
    try {
      allowed.push(sheetAllowed.getCell(i, 0).value.toString());
    } catch (e) {
      break;
    }
  }

  const done: Array<{ date: string; value: string }> = [];
  for (let i = 0; i < sheetDone.rowCount; i++) {
    try {
      const date = sheetDone.getCell(i, 0).value.toString();
      const value = sheetDone.getCell(i, 1).value.toString();

      if (!date || !value) {
        break;
      }

      done.push({ date, value });
    } catch (e) {
      break;
    }
  }

  return {
    sheetDone,
    allowed,
    done,
  };
}
