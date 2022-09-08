import * as yargs from "yargs";
import * as googleTrends from "google-trends-api";
import {
  createDirectoriesRelative,
  readDirectoryContent,
  readFilename,
  readFileToJson,
  writeJsonToFile,
  writeTextToFile,
} from "./fs-helpers";
import { config } from "./config";
import { lp, sleep, subArray } from "./helpers";

enum Options {
  Source = "source",
  Result = "result",
}

interface WordPopularity {
  word: string;
  value: number;
}

export const iotDiagramBuilderAndHandler = {
  builder: {
    [Options.Source]: {
      describe: `Path to directory in ${config.userDocumentsDirectoryName} containing requests resulting JSON data. (default: --${Options.Source}="${config.interestOverTimeResultsDirectoryName}")`,
      type: "string",
    },
    [Options.Result]: {
      describe: `Path to HTML file in ${config.userDocumentsDirectoryName} that the interest over time diagram will be rendered in. (default: --${Options.Result}="${config.resultVisualizationFilename}")`,
      type: "string",
    },
  } as yargs.CommandBuilder,
  handler: async (argv) => {
    const sourceDirectoryPath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Source] ?? config.interestOverTimeResultsDirectoryName
    }`;
    const resultFilepath = `./${config.userDocumentsDirectoryName}/${
      argv[Options.Result] ?? config.resultVisualizationFilename
    }`;

    await gatherInterestOverTime(sourceDirectoryPath, resultFilepath);
  },
};

export function registerIotDiagramCommand() {
  yargs.command({
    command: "iot-diagram",
    describe:
      "Takes a source directory of interest over time JSON data, relates them to one another and renders them in a diagram in the resulting HTML file.",
    ...iotDiagramBuilderAndHandler,
  });
}

async function gatherInterestOverTime(
  sourceDirectoryPath: string,
  resultFilepath: string
) {
  // TODO: make this calculation for all the diagram's values not just for the averages
  // then put all those values in csv form to check with an 'excel' diagram
  // then use chart.js or something similar to render a web page with a js diagram of the data

  const iotJsonFiles = readDirectoryContent(sourceDirectoryPath);
  const relatedAverages: WordPopularity[] = [];

  iotJsonFiles.forEach((file) => {
    const json = readFileToJson(`${sourceDirectoryPath}/${file}`);
    const words = json["words"];
    const averages = json["default"]["averages"] as number[];

    console.log(words, averages);

    const normingValue = averages.splice(0, 1)[0];

    if (relatedAverages.length === 0)
      relatedAverages.push(makeWordPopularity(words[0], 100));

    averages.forEach((value, index) =>
      relatedAverages.push(
        makeWordPopularity(words[index + 1], (100 * value) / normingValue)
      )
    );
  });

  console.table(relatedAverages);

  const relatedAveragesCsv: string = relatedAverages.reduce(
    (accumulator, relatedAverage) =>
      (accumulator += `${relatedAverage.word},${relatedAverage.value}\r\n`),
    ""
  );
  writeTextToFile(relatedAveragesCsv, resultFilepath);
}

function makeWordPopularity(word: string, value: number): WordPopularity {
  return { word, value };
}
