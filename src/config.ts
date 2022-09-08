import { readFileToJson } from "./fs-helpers";
import { readDbConfig } from "./db-helpers";

// TYPES
export interface Config {
  consecutiveRequestDelayMS: number;
  interestOverTimeResultsDirectoryName: string;
  logProgress: boolean;
  openthesaurusDbConfigFilename: string;
  relatedQueriesResultsDirectoryName: string;
  relateWordsPerQuery: number;
  resultVisualizationFilename: string;
  sourceAndSynonymWordsJsonFilename: string;
  sourceWordsJsonFilename: string;
  userDocumentsDirectoryName: string;
}

// FUNCTIONS
function readConfig(filepath: string): Config {
  return readFileToJson(filepath) as Config;
}

// CONSTS
const configDirectoryPath: string = "./config/";
export const config: Config = readConfig(configDirectoryPath + "config.json");

export const openthesaurusDbConfig = readDbConfig(
  configDirectoryPath + config.openthesaurusDbConfigFilename
);
