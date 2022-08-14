import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

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
