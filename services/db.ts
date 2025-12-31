
import { TableData } from '../types';

declare var alasql: any;
declare var XLSX: any;
declare var Papa: any;
declare var jspdf: any;

export class DataService {
  private static tableName = 'uploaded_data';

  static async initTable(data: TableData): Promise<void> {
    try {
      if (alasql.tables[this.tableName]) {
        alasql(`DROP TABLE ${this.tableName}`);
      }
      
      const colDefs = data.columns.map(col => `\`${col.name}\` ${this.mapToSqlType(col.type)}`).join(', ');
      alasql(`CREATE TABLE ${this.tableName} (${colDefs})`);
      alasql.tables[this.tableName].data = data.rows;
      console.log(`DuckDB Simulator (AlaSQL) initialized with ${data.rows.length} rows.`);
    } catch (error) {
      console.error('Database Init Error:', error);
      throw new Error('Failed to initialize local data engine.');
    }
  }

  private static mapToSqlType(type: string): string {
    switch (type) {
      case 'number': return 'DECIMAL';
      case 'date': return 'TIMESTAMP';
      case 'boolean': return 'BOOLEAN';
      default: return 'STRING';
    }
  }

  static async executeQuery(sql: string): Promise<any[]> {
    try {
      const trimmedSql = sql.trim().toUpperCase();
      if (!trimmedSql.startsWith('SELECT')) {
        throw new Error('Only read-only SELECT queries are permitted.');
      }

      let safeSql = sql;
      if (!safeSql.toUpperCase().includes(this.tableName.toUpperCase())) {
         safeSql = safeSql.replace(/FROM\s+([a-zA-Z0-9_]+)/i, `FROM ${this.tableName}`);
      }
      
      const result = alasql(safeSql);
      return Array.isArray(result) ? result : [result];
    } catch (error: any) {
      throw new Error(error.message || 'SQL Engine error. Verify query syntax.');
    }
  }

  static triggerDownload(url: string, filename: string) {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
  }

  static async downloadResultAsCSV(data: any[], filename: string) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    this.triggerDownload(URL.createObjectURL(blob), `${filename}.csv`);
  }

  static async downloadResultAsExcel(data: any[], filename: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  static async downloadResultAsPDF(data: any[], filename: string) {
    const { jsPDF } = jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    const cols = Object.keys(data[0]);
    const rows = data.map(r => cols.map(c => r[c]));

    // @ts-ignore
    doc.autoTable({
      head: [cols],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    doc.save(`${filename}.pdf`);
  }
}
