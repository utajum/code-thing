import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { Log } from "./envSetup";
import {
  findFakeTurn,
  validateMap,
  convertToCoordinateSystem,
  walkOver,
  processFile,
} from "./utils";
import { MapFile } from "./types";

const mapsDir = path.join(__dirname, "./maps");
const mapFiles: Array<MapFile> = [];

const failedFiles: Array<string> = [];

fs.readdirSync(mapsDir).forEach((filename) => {
  const fileData = fs.readFileSync(`${mapsDir}/${filename}`, "utf8").toString();

  mapFiles.push({ filename, fileData });
});

const firstQuestion = "Chose Map";
const secondQuestion = "Process all Maps";

Log.info(`NODE version: ${process.version}`);

mapFiles.forEach((mapFile) => {
  if (mapFile.filename !== "02-straight-trough.txt") return;
  processFile(mapFile, failedFiles);
});

// print failed files
if (failedFiles.length) {
  console.log("Failed files:");
  Log.error(JSON.stringify(failedFiles, null, 2));
}

inquirer
  .prompt([
    {
      type: "list",
      name: "run",
      message: "What do you want to do?",
      choices: [firstQuestion, secondQuestion],
    },
  ])
  .then((answers) => {
    if (answers.run === firstQuestion) {
      inquirer
        .prompt([
          {
            type: "list",
            name: "run",
            message: "File List",
            choices: mapFiles.map((e) => e.filename),
          },
        ])
        .then((selectedFile) => {
          const findMap = mapFiles.find((e) => e.filename === selectedFile.run);
          processFile(findMap, failedFiles);
          if (failedFiles.length) {
            console.log("Failed files:");
            Log.error(JSON.stringify(failedFiles, null, 2));
          }
        });
    }
    if (answers.run === secondQuestion) {
      mapFiles.forEach((mapFile) => {
        processFile(mapFile, failedFiles);
      });
      // print failed files
      if (failedFiles.length) {
        console.log("Failed files:");
        Log.error(JSON.stringify(failedFiles, null, 2));
      }
    }
  })
  .catch((error) => {
    Log.error(error);
  });
