#!/usr/bin/env node
import * as yargs from "yargs";
import { registerSynonymsCommand } from "./synonyms";
import { registerIotCommand } from "./interestOverTime";
import { registerIotDiagramCommand } from "./interestOverTimeDiagram";
import { registerRqCommand } from "./relatedQueries";

// MAIN
(async function main() {
  registerCommands();
})();

function registerCommands() {
  registerSynonymsCommand();
  registerIotCommand();
  registerIotDiagramCommand();
  registerRqCommand();

  yargs.parse();
}

// TODO: make sure user_documents folder exists...
// function relateAllIotRequests(sourceDirectory: string) {}
