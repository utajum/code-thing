import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { Log } from "./envSetup";
import { processFile } from "./utils";
import { MapFile } from "./types";

const mapsDir = path.join(__dirname, "./maps");
const mapFiles: Array<MapFile> = [];

let failedFiles: Array<string> = [];

fs.readdirSync(mapsDir).forEach((filename) => {
  const fileData = fs.readFileSync(`${mapsDir}/${filename}`, "utf8").toString();

  mapFiles.push({ filename, fileData });
});

const firstQuestion = "Chose Map";
const secondQuestion = "Process all Maps";
const thirdQuestion = "Run Jest Tests";
const fourthQuestion = "Exit";

Log.info(`NODE version: ${process.version}`);

const initQuestions = () => {
  failedFiles = [];
  return inquirer
    .prompt([
      {
        type: "list",
        name: "run",
        message: "What do you want to do?",
        choices: [firstQuestion, secondQuestion, thirdQuestion, fourthQuestion],
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
            const findMap = mapFiles.find(
              (e) => e.filename === selectedFile.run
            );
            processFile(findMap, failedFiles);
            if (failedFiles.length) {
              Log.error("Failed files:");
              Log.error(JSON.stringify(failedFiles, null, 2));
            }
            initQuestions();
          });
      }
      if (answers.run === secondQuestion) {
        mapFiles.forEach((mapFile) => {
          processFile(mapFile, failedFiles);
        });
        // print failed files
        if (failedFiles.length) {
          Log.error("Failed files:");
          Log.error(JSON.stringify(failedFiles, null, 2));
        }
        initQuestions();
      }
      if (answers.run === fourthQuestion) {
        process.exit(0);
      }
      if (answers.run === thirdQuestion) {
        const jestConfig = `
          module.exports = {
            testEnvironment: "node",
          };`;

        const dirToWrite = process.cwd() + "/build";

        if (!fs.existsSync(dirToWrite)) {
          fs.mkdirSync(dirToWrite, { recursive: true });
        }

        fs.writeFileSync(`${dirToWrite}/jest.config.js`, jestConfig);

        const recursiveCopySync = (source: string, target: string) => {
          if (fs.lstatSync(source).isDirectory()) {
            if (!fs.existsSync(target)) {
              fs.mkdirSync(target);
            }
            let files = fs.readdirSync(source);
            files.forEach((file) => {
              recursiveCopySync(
                path.join(source, file),
                path.join(target, file)
              );
            });
          } else {
            if (fs.existsSync(source)) {
              fs.writeFileSync(target, fs.readFileSync(source));
            }
          }
        };

        try {
          fs.copyFileSync(
            __dirname + "/index.test.js",
            dirToWrite + "/index.test.js"
          );
          recursiveCopySync(__dirname + "/maps", dirToWrite + "/maps");
        } catch (err) {}

        const jest = require("jest");

        jest.run([`--config='${dirToWrite}/jest.config.js'`]);
        setTimeout(() => {
          initQuestions();
        }, 4000);
      }
      if (answers.run === fourthQuestion) {
        process.exit(0);
      }
    })
    .catch((error) => {
      Log.error(error);
    });
};
initQuestions();
