import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
const path = require("path");

// FUNCTIONS
export function createDirectoriesRelative(relativeDirectoryPaths: string[]) {
  relativeDirectoryPaths.forEach((directory) => {
    const absolutePath = `${process.cwd()}/${directory}`;

    if (!existsSync(absolutePath)) mkdirSync(absolutePath);
  });
}

export function readFileToJson(filepath: string): Object {
  return JSON.parse(readFileSync(filepath).toString());
}

export function writeJsonToFile(json: Object, filepath: string) {
  writeFileSync(filepath, JSON.stringify(json, null, "  "), "utf8");
}

export function writeTextToFile(text: string, filepath: string) {
  writeFileSync(filepath, text, "utf8");
}

export function readDirectoryContent(directoryPath: string): string[] {
  return readdirSync(directoryPath, "utf8");
}

export function readFilename(filepath: string): string {
  return path.parse(filepath).name;
}
