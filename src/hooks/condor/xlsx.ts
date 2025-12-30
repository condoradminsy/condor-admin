import * as xlsx from 'xlsx';
import type { JSON2SheetOpts, WorkBook, WritingOptions } from 'xlsx';

const { utils, writeFile } = xlsx;

type JsonToSheet = {
  data: any[];
  header?: any[];
  filename?: string;
  jsonSheetOpts?: JSON2SheetOpts;
  writeExcelOpts?: WritingOptions;
};

export const useXlsx = ({
  data,
  header,
  filename = 'excel-list.xlsx',
  jsonSheetOpts,
  writeExcelOpts = { bookType: 'xlsx' }
}: JsonToSheet) => {
  const exportData = [...data];
  const jsonSheetOptsFinal: JSON2SheetOpts = jsonSheetOpts || {};
  // 如果有 header，则添加到数据开头
  if (header && header.length > 0) {
    exportData.unshift(header);
    jsonSheetOptsFinal.skipHeader = true;
  }
  const worksheet = utils.json_to_sheet(exportData, jsonSheetOptsFinal);
  const workbook: WorkBook = {
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: worksheet
    }
  };
  writeFile(workbook, filename, writeExcelOpts);
};
