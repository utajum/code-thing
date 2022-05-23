import fs from "fs";
import path from "path";

import { processFile } from "../src/utils";
import { MapFile } from "../src/types";

const mapsDir = path.join(__dirname, "./maps");
const mapFiles: Array<MapFile> = [];

let failedFiles: Array<string> = [];

fs.readdirSync(mapsDir).forEach((filename) => {
  const fileData = fs.readFileSync(`${mapsDir}/${filename}`, "utf8").toString();

  mapFiles.push({ filename, fileData });
});

mapFiles.forEach((mapFile) => {
  const { letters, pathAsCharacters, error } = processFile(
    mapFile,
    failedFiles,
    true
  );

  switch (mapFile.filename) {
    case "01-basic.txt": {
      describe("01-basic.txt", () => {
        test("no errors", () => {
          expect(error).toBe(false);
        });
        test("correct output", () => {
          expect({ letters, pathAsCharacters }).toEqual({
            letters: "ACB",
            pathAsCharacters: "@---A---+|C|+---+|+-B-x",
          });
        });
      });

      break;
    }
    case "02-straight-trough.txt": {
      describe("02-straight-trough.txt", () => {
        test("no errors", () => {
          expect(error).toBe(false);
        });
        test("correct output", () => {
          expect({ letters, pathAsCharacters }).toEqual({
            letters: "ABCD",
            pathAsCharacters: "@|A+---B--+|+--C-+|-||+---D--+|x",
          });
        });
      });

      break;
    }
    case "03-letters-on-turns.txt": {
      describe("03-letters-on-turns.txt", () => {
        test("no errors", () => {
          expect(error).toBe(false);
        });
        test("correct output", () => {
          expect({ letters, pathAsCharacters }).toEqual({
            letters: "ACB",
            pathAsCharacters: "@---A---+|||C---+|+-B-x",
          });
        });
      });

      break;
    }
    case "04-ignore-twice.txt": {
      describe("04-ignore-twice.txt", () => {
        test("no errors", () => {
          expect(error).toBe(false);
        });
        test("correct output", () => {
          expect({ letters, pathAsCharacters }).toEqual({
            letters: "GOONIES",
            pathAsCharacters: "@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x",
          });
        });
      });

      break;
    }
    case "05-keep-direction.txt": {
      describe("05-keep-direction.txt", () => {
        test("no errors", () => {
          expect(error).toBe(false);
        });
        test("correct output", () => {
          expect({ letters, pathAsCharacters }).toEqual({
            letters: "BLAH",
            pathAsCharacters: "@B+++B|+-L-+A+++A-+Hx",
          });
        });
      });

      break;
    }
    case "06-ignore-after-end.txt": {
      describe("06-ignore-after-end.txt", () => {
        test("no errors", () => {
          expect(error).toBe(false);
        });
        test("correct output", () => {
          expect({ letters, pathAsCharacters }).toEqual({
            letters: "AB",
            pathAsCharacters: "@-A--+|+-B--x",
          });
        });
      });

      break;
    }
    case "07-missing-start.txt": {
      describe("07-missing-start.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "08-missing-end.txt": {
      describe("08-missing-end.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "09-multiple-starts01.txt": {
      describe("09-multiple-starts01.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "09-multiple-starts02.txt": {
      describe("09-multiple-starts02.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "09-multiple-starts03.txt": {
      describe("09-multiple-starts03.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "10-fork-in-path.txt": {
      describe("10-fork-in-path.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "11-broken-path.txt": {
      describe("11-broken-path.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "12-multiple-starting-paths.txt": {
      describe("12-multiple-starting-paths.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
    case "13-fake-turn.txt": {
      describe("13-fake-turn.txt", () => {
        test("has error", () => {
          expect(error).toBe(true);
        });
      });

      break;
    }
  }
});
