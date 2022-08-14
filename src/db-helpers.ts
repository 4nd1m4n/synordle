import { readFileToJson } from "./fs-helpers";

// TYPES
export interface DbConfig {
  host: string; // "localhost"
  user: string; // "root"
  password: string; // "your password"
  database: string; // "openthesaurus"
}

// FUNCTIONS
export function readDbConfig(filepath): DbConfig {
  return readFileToJson(filepath) as DbConfig;
}

export function getSynonyms(connection, sourceWords) {
  return Promise.all(
    sourceWords.map(async (word) => {
      const sqlQuery = buildSqlQuery(word);
      return (await query(connection, sqlQuery)) as Array<{
        word: string;
      }>;
    })
  );
}

export function createConnection(mysql, config: DbConfig) {
  return mysql.createConnection(config);
}

export function connect(connection) {
  return new Promise<void>((resolve, reject) => {
    connection.connect((error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
}

function buildSqlQuery(word: string) {
  return `SELECT term.word FROM term, synset, term term2 WHERE synset.is_visible = 1 AND synset.id = term.synset_id AND term2.synset_id = synset.id AND term2.word = '${word}';`;
}

async function query(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, result, fields) => {
      if (error) reject(error);
      return resolve(result);
    });
  });
}
