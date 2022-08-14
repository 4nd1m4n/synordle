import * as yargs from "yargs";
import * as googleTrends from "google-trends-api";
import {
  createDirectoriesRelative,
  readFileToJson,
  writeJsonToFile,
} from "./fs-helpers";
import { config } from "./config";
import { lp, sleep, subArray } from "./helpers";

enum Options {
  Source = "source",
  Result = "result",
}

export const iotBuilderAndHandler = {
  builder: {
    [Options.Source]: {
      describe: `Filepath to JSON file in ${config.userDocumentsDirectoryName} containing source word list as array of strings. (default: --${Options.Source}="${config.sourceAndSynonymWordsJsonFilename}")`,
      type: "string",
    },
    [Options.Result]: {
      describe: `Path to Directory in ${config.userDocumentsDirectoryName} that the requests resulting JSON data will be stored in. (default: --${Options.Result}="${config.interestOverTimeResultsDirectoryName}")`,
      type: "string",
    },
  } as yargs.CommandBuilder,
  handler: async (argv) => {
    const sourceFilepath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Source]
        ? argv[Options.Source]
        : config.sourceAndSynonymWordsJsonFilename
    }`;
    const resultDirectoryPath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Result]
        ? argv[Options.Result]
        : config.interestOverTimeResultsDirectoryName
    }`;

    // TODO: make cli configurable
    const consecutiveRequestDelayMS = 1000;
    // TODO: make config.relateWordsPerQuery cli configurable
    // TODO: introduce missing request results retry -> for only redoing requests that failed...

    await gatherInterestOverTime(
      sourceFilepath,
      resultDirectoryPath,
      consecutiveRequestDelayMS
    );
  },
};

export function registerIotCommand() {
  yargs.command({
    command: "iot",
    describe:
      "Takes a source list of words, splits them up into n-tuples, builds requests for googles trends interest-over-time api with them and gathers the results of these requests in the default or given directory.",
    ...iotBuilderAndHandler,
  });
}

async function gatherInterestOverTime(
  sourceFilepath: string,
  resultsDirectory: string,
  consecutiveRequestDelayMS: number
) {
  const words = readFileToJson(sourceFilepath) as string[];
  lp("# Loaded source words\n", words);

  const normingWord = words[0];
  lp("# Norming word\n", normingWord);

  createDirectoriesRelative([resultsDirectory]);
  lp(`# Created directories ${[resultsDirectory]} successfully!`);

  if (words.length < 1)
    return console.error(
      `To few words to relate to one another!\n${sourceFilepath} must have at least one word.`
    );

  for (
    let index = 1;
    index < words.length;
    index += config.relateWordsPerQuery
  ) {
    const toRelateWords = subArray(words, index, config.relateWordsPerQuery);
    const keywords = [normingWord].concat(toRelateWords);

    await sleep(consecutiveRequestDelayMS);

    await requestInterestOverTime(keywords)
      .then(function (results) {
        const resultsJson = JSON.parse(results);
        lp(resultsJson);

        const filename = `${resultsDirectory}/${keywords.join("_")}.json`;
        writeJsonToFile(resultsJson, filename);
        lp(`# Wrote JSON file '${filename}'`);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}

function requestInterestOverTime(keywords: string[]) {
  return googleTrends.interestOverTime({
    keyword: keywords,
    geo: "DE",
    hl: "de",
  });
}
