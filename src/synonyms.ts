import * as yargs from "yargs";
const mysql = require("mysql");
import { readFileToJson, writeJsonToFile } from "./fs-helpers";
import { connect, createConnection, DbConfig, getSynonyms } from "./db-helpers";
import { config, openthesaurusDbConfig } from "./config";
import { lp, uniqueFlattenedArrayOfObjectsByKey } from "./helpers";

enum Options {
  Source = "source",
  Result = "result",
}

export const synonymsBuilderAndHandler = {
  builder: {
    [Options.Source]: {
      describe: `Filepath to JSON file in ${config.userDocumentsDirectoryName} containing source word list as array of strings. (default: --${Options.Source}="${config.sourceWordsJsonFilename}")`,
      type: "string",
    },
    [Options.Result]: {
      describe: `Filepath to JSON file in ${config.userDocumentsDirectoryName} resulting word list with the format of array of strings. (default: --${Options.Result}="${config.sourceAndSynonymWordsJsonFilename}")`,
      type: "string",
    },
  } as yargs.CommandBuilder,
  handler: async (argv) => {
    const sourceFilepath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Source]
        ? argv[Options.Source]
        : config.sourceWordsJsonFilename
    }`;
    const resultFilepath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Result]
        ? argv[Options.Result]
        : config.sourceAndSynonymWordsJsonFilename
    }`;

    await gatherSynonyms(openthesaurusDbConfig, sourceFilepath, resultFilepath);
  },
};

export function registerSynonymsCommand() {
  yargs.command({
    command: "synonyms",
    describe:
      "Takes a source list of words, finds synonyms for each word and returns a new list with the source words and the found synonymes.",
    ...synonymsBuilderAndHandler,
  });
}

async function gatherSynonyms(
  dbConfig: DbConfig,
  sourceFilepath: string,
  resultFilepath: string
) {
  const words = readFileToJson(sourceFilepath) as string[];
  lp("# Loaded source words\n", words);

  const connection = createConnection(mysql, dbConfig);
  await connect(connection);
  lp("# Connected to MySQL Server");

  const synonyms = await getSynonyms(connection, words);
  const uniqueSynonyms = uniqueFlattenedArrayOfObjectsByKey(synonyms, "word");
  writeJsonToFile(uniqueSynonyms, resultFilepath);

  lp(`# Wrote JSON file '${resultFilepath}'.`);
  await connection.end();
  lp("# Disconnected from MySQL Server");
}
