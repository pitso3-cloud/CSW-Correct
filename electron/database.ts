import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs-extra';
import path from 'path';
import { app } from 'electron';

let db: SqlJsDatabase | null = null;
let SQL: any = null;
const DB_PATH = path.join(app.getPath('userData'), 'csw_database.db');

async function initializeSQL() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) {
          return `https://sql.js.org/dist/${file}`;
        }
        return file;
      }
    });
  }
  return SQL;
}

async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initializeSQL();

  try {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (error) {
    console.error('Failed to load database:', error);
    db = new SQL.Database();
  }

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.ensureDirSync(path.dirname(DB_PATH));
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export async function initializeDatabase() {
  try {
    const database = await getDb();

    database.run(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_number INTEGER,
        title TEXT,
        content TEXT,
        page_start TEXT,
        page_end TEXT
      );

      CREATE TABLE IF NOT EXISTS compliance_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        check_id TEXT UNIQUE,
        category TEXT,
        rule_description TEXT,
        severity TEXT,
        csw_reference TEXT
      );

      CREATE TABLE IF NOT EXISTS abbreviations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        abbreviation TEXT UNIQUE,
        full_term TEXT,
        category TEXT
      );

      CREATE TABLE IF NOT EXISTS ranks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT,
        rank_name TEXT,
        abbreviation TEXT,
        pay_grade INTEGER
      );

      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rank TEXT,
        name TEXT,
        unit TEXT,
        is_default BOOLEAN DEFAULT 0
      );
    `);

    const chapterResult = database.exec('SELECT count(*) as count FROM chapters');
    const rankResult = database.exec('SELECT count(*) as count FROM ranks');

    const chapterCount = chapterResult.length > 0 ? chapterResult[0].values[0][0] : 0;
    const rankCount = rankResult.length > 0 ? rankResult[0].values[0][0] : 0;

    if ((chapterCount as number) === 0 || (rankCount as number) === 0) {
      seedDatabase(database);
    }

    saveDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

function seedDatabase(database: SqlJsDatabase) {
  try {
    database.run('INSERT OR IGNORE INTO chapters (chapter_number, title, content) VALUES (?, ?, ?)', 
      [2, 'Standard Layout Principles', 'Margins: 2cm all sides. Font: Arial 12. Spacing: Single.']);

    database.run('INSERT OR IGNORE INTO compliance_rules (check_id, category, rule_description, severity, csw_reference) VALUES (?, ?, ?, ?, ?)', 
      ['FMT-001', 'Formatting', 'Margins must be 2cm on all sides', 'Error', 'Chapter 2, Para 12']);
    database.run('INSERT OR IGNORE INTO compliance_rules (check_id, category, rule_description, severity, csw_reference) VALUES (?, ?, ?, ?, ?)', 
      ['FMT-002', 'Formatting', 'Font must be Arial, size 12', 'Error', 'Chapter 2, Para 15']);
    database.run('INSERT OR IGNORE INTO compliance_rules (check_id, category, rule_description, severity, csw_reference) VALUES (?, ?, ?, ?, ?)', 
      ['FMT-007', 'Formatting', 'Security classification missing in header/footer', 'Critical', 'Chapter 2, Para 40']);

    database.run('INSERT OR IGNORE INTO abbreviations (abbreviation, full_term, category) VALUES (?, ?, ?)', 
      ['C LOG', 'Chief of Logistics', 'Appointments']);
    database.run('INSERT OR IGNORE INTO abbreviations (abbreviation, full_term, category) VALUES (?, ?, ?)', 
      ['SANDF', 'South African National Defence Force', 'General']);
    database.run('INSERT OR IGNORE INTO abbreviations (abbreviation, full_term, category) VALUES (?, ?, ?)', 
      ['DOD', 'Department of Defence', 'General']);
    database.run('INSERT OR IGNORE INTO abbreviations (abbreviation, full_term, category) VALUES (?, ?, ?)', 
      ['CSW', 'Conventions of Service Writing', 'General']);
    database.run('INSERT OR IGNORE INTO abbreviations (abbreviation, full_term, category) VALUES (?, ?, ?)', 
      ['ASAP', 'As Soon As Possible', 'General']);

    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Army', 'General', 'Gen', 10]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Army', 'Lieutenant General', 'Lt Gen', 9]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Army', 'Colonel', 'Col', 6]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Navy', 'Admiral', 'Adm', 10]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Navy', 'Vice Admiral', 'V Adm', 9]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Navy', 'Captain (Navy)', 'Capt (SAN)', 6]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Air Force', 'General', 'Gen', 10]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Air Force', 'Lieutenant General', 'Lt Gen', 9]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['Air Force', 'Colonel', 'Col', 6]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['SAMHS', 'General', 'Gen', 10]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['SAMHS', 'Lieutenant General', 'Lt Gen', 9]);
    database.run('INSERT OR IGNORE INTO ranks (service, rank_name, abbreviation, pay_grade) VALUES (?, ?, ?, ?)', ['SAMHS', 'Colonel', 'Col', 6]);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export async function getRules() {
  try {
    const database = await getDb();
    const result = database.exec('SELECT * FROM compliance_rules');
    if (result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => { obj[col] = row[idx]; });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return [];
  }
}

export async function getChapters() {
  try {
    const database = await getDb();
    const result = database.exec('SELECT * FROM chapters');
    if (result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => { obj[col] = row[idx]; });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
}

export async function getAbbreviations(query: string = '') {
  try {
    const database = await getDb();
    let result = !query
      ? database.exec('SELECT * FROM abbreviations ORDER BY abbreviation ASC')
      : database.exec('SELECT * FROM abbreviations WHERE abbreviation LIKE ? OR full_term LIKE ?', [`%${query}%`, `%${query}%`]);
    if (result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => { obj[col] = row[idx]; });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching abbreviations:', error);
    return [];
  }
}

export async function getRanks(service: string = 'Army') {
  try {
    const database = await getDb();
    const result = database.exec('SELECT * FROM ranks WHERE service = ? ORDER BY pay_grade DESC', [service]);
    if (result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => { obj[col] = row[idx]; });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching ranks:', error);
    return [];
  }
}