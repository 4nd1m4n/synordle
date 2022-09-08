import * as yargs from "yargs";
import * as googleTrends from "google-trends-api";
import {
  createDirectoriesRelative,
  readFileToJson,
  writeJsonToFile,
} from "./fs-helpers";
import { config } from "./config";
import { lp, sleep } from "./helpers";

enum Options {
  Source = "source",
  Result = "result",
  Delay = "delay",
}

export const rqBuilderAndHandler = {
  builder: {
    [Options.Source]: {
      describe: `Filepath to JSON file in ${config.userDocumentsDirectoryName} containing source word list as array of strings. (default: --${Options.Source}="${config.sourceAndSynonymWordsJsonFilename}")`,
      type: "string",
    },
    [Options.Result]: {
      describe: `Path to Directory in ${config.userDocumentsDirectoryName} that the requests resulting JSON data will be stored in. (default: --${Options.Result}="${config.relatedQueriesResultsDirectoryName}")`,
      type: "string",
    },
    [Options.Delay]: {
      describe: `Will set the delay that is waited between consecutive requests to the api. Higher delay's help avoiding failing requests with numerous words. (default: --${Options.Delay}="${config.consecutiveRequestDelayMS}")`,
      type: "number",
    },
  } as yargs.CommandBuilder,
  handler: async (argv) => {
    const sourceFilepath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Source] ?? config.sourceAndSynonymWordsJsonFilename
    }`;
    const resultDirectoryPath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Result] ?? config.relatedQueriesResultsDirectoryName
    }`;
    const consecutiveRequestDelayMS =
      argv[Options.Delay] ?? config.consecutiveRequestDelayMS;

    // TODO: introduce missing request results retry -> for only redoing requests that failed...

    await gatherRelatedQueries(
      sourceFilepath,
      resultDirectoryPath,
      consecutiveRequestDelayMS
    );
  },
};

export function registerRqCommand() {
  yargs.command({
    command: "rq",
    describe:
      "Takes a source list of words then builds requests for googles trends related-queries api with them and gathers the results of these requests in the default or given directory.",
    ...rqBuilderAndHandler,
  });
}

async function gatherRelatedQueries(
  sourceFilepath: string,
  resultsDirectory: string,
  consecutiveRequestDelayMS: number
) {
  const words = readFileToJson(sourceFilepath) as string[];
  lp("# Loaded source words\n", words);

  createDirectoriesRelative([resultsDirectory]);
  lp(`# Created directories ${[resultsDirectory]} successfully!`);

  for (let index = 0; index < words.length; index++) {
    const keyword = words[index];

    await sleep(consecutiveRequestDelayMS);

    await requestRelatedQueries(keyword)
      .then(function (results) {
        const resultsJson = JSON.parse(results);
        lp(resultsJson);

        const filename = `${resultsDirectory}/${keyword}.json`;
        writeJsonToFile(resultsJson, filename);
        lp(`# Wrote JSON file '${filename}'`);
      })
      .catch(function (error) {
        console.error(error);
      });
  }
}

function requestRelatedQueries(keyword: string) {
  return googleTrends.relatedQueries({
    keyword: keyword,
    geo: "DE",
    hl: "de",
  });
}
