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
  Delay = "delay",
  Relate = "relate",
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
    [Options.Delay]: {
      describe: `Will set the delay that is waited between consecutive requests to the api. Higher delay's help avoiding failing requests with numerous words. (default: --${Options.Delay}="${config.consecutiveRequestDelayMS}")`,
      type: "number",
    },
    [Options.Relate]: {
      describe: `Trends api only allows a maximum of 5 words per query. That means that the range for words to relate to another word is inclusive from 1 to 4. Best to leave it at 4 unless the api changes. (default: --${Options.Relate}="${config.relateWordsPerQuery}")`,
      type: "number",
    },
  } as yargs.CommandBuilder,
  handler: async (argv) => {
    const sourceFilepath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Source] ?? config.sourceAndSynonymWordsJsonFilename
    }`;
    const resultDirectoryPath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Result] ?? config.interestOverTimeResultsDirectoryName
    }`;
    const consecutiveRequestDelayMS =
      argv[Options.Delay] ?? config.consecutiveRequestDelayMS;
    const relateWordsPerQuery =
      argv[Options.Relate] ?? config.relateWordsPerQuery;

    // TODO: introduce missing request results retry -> for only redoing requests that failed...

    await gatherInterestOverTime(
      sourceFilepath,
      resultDirectoryPath,
      consecutiveRequestDelayMS,
      relateWordsPerQuery
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
  consecutiveRequestDelayMS: number,
  relateWordsPerQuery: number
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

  for (let index = 1; index < words.length; index += relateWordsPerQuery) {
    const toRelateWords = subArray(words, index, relateWordsPerQuery);
    const keywords = [normingWord].concat(toRelateWords);

    await sleep(consecutiveRequestDelayMS);

    await requestInterestOverTime(keywords)
      .then(function (results) {
        const resultsJson = JSON.parse(results);
        resultsJson["words"] = keywords;

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
