import { CoordinateSystem, CoordinatesObject, MapFile } from "./types";
import { Log } from "./envSetup";

const allowedSecialCharacters = ["@", "+", "-", "|", " ", "\n"];

export const findFakeTurn = (cSystem: CoordinateSystem) => {
  const findFake = cSystem
    .map((turnCoordinates) => {
      if (turnCoordinates.character === "+") {
        const hasXNeighbour = cSystem.find((e) => {
          if (
            e.xPosition === turnCoordinates.xPosition + 1 ||
            e.xPosition === turnCoordinates.xPosition - 1
          ) {
            return e;
          }
        });

        const hasYNeighbour = cSystem.find((e) => {
          if (
            e.yPosition === turnCoordinates.yPosition + 1 ||
            e.yPosition === turnCoordinates.yPosition - 1
          ) {
            return e;
          }
        });
        const isFake = !(hasXNeighbour && hasYNeighbour);

        if (isFake) {
          return true;
        }
        return null;
      }
      return null;
    })
    .filter((e) => e);

  if (findFake.length) {
    return true;
  }
  return false;
};

const validateNext = (character: string) => {
  if (
    character === "-" ||
    character === "+" ||
    character === "|" ||
    character === "x" ||
    /[A-Z]/.test(character)
  ) {
    return true;
  }
  return false;
};

let passedCoordinates: Array<{
  file: MapFile;
  coordinates: CoordinatesObject;
}> = [];

let passedOnceCoordinates: Array<{
  file: MapFile;
  coordinates: CoordinatesObject;
}> = [];

export const isCollectedTwice = (
  cSystem: CoordinateSystem,
  corToTest: CoordinatesObject
) => {
  const hasXLeftNeighbour = cSystem.find((e) => {
    if (
      e.xPosition === corToTest.xPosition - 1 &&
      e.yPosition === corToTest.yPosition &&
      validateNext(e.character)
    ) {
      return e;
    }
  });

  const hasXRightNeighbour = cSystem.find((e) => {
    if (
      e.xPosition === corToTest.xPosition + 1 &&
      e.yPosition === corToTest.yPosition &&
      validateNext(e.character)
    ) {
      return e;
    }
  });

  const hasYUpNeighbour = cSystem.find((e) => {
    if (
      e.yPosition === corToTest.yPosition + 1 &&
      e.xPosition === corToTest.xPosition &&
      validateNext(e.character)
    ) {
      return e;
    }
  });

  const hasYDownNeighbour = cSystem.find((e) => {
    if (
      e.yPosition === corToTest.yPosition - 1 &&
      e.xPosition === corToTest.xPosition &&
      validateNext(e.character)
    ) {
      return e;
    }
  });

  if (
    hasXLeftNeighbour &&
    hasXRightNeighbour &&
    hasYUpNeighbour &&
    hasYDownNeighbour
  ) {
    return {
      corToTest,
      hasXLeftNeighbour,
      hasXRightNeighbour,
      hasYUpNeighbour,
      hasYDownNeighbour,
    };
  }

  return false;
};

export const findPossibleNext = (
  cSystem: CoordinateSystem,
  coordinatesToTest: CoordinatesObject,
  mapFile: MapFile,
  result: any = [],
  result2: any = []
) => {
  const possibleNextX = cSystem.filter((e) => {
    if (
      e.xPosition === coordinatesToTest.xPosition + 1 &&
      e.yPosition === coordinatesToTest.yPosition
    ) {
      if (e.character === "|") {
        return false;
      }

      return validateNext(e.character);
    }

    if (
      e.xPosition === coordinatesToTest.xPosition - 1 &&
      e.yPosition === coordinatesToTest.yPosition
    ) {
      if (e.character === "|") {
        return false;
      }
      return validateNext(e.character);
    }

    return false;
  });

  const possibleNextY = cSystem.filter((e) => {
    if (
      e.xPosition === coordinatesToTest.xPosition &&
      e.yPosition === coordinatesToTest.yPosition + 1
    ) {
      if (e.character === "-") {
        return false;
      }
      return validateNext(e.character);
    }
    if (
      e.xPosition === coordinatesToTest.xPosition &&
      e.yPosition === coordinatesToTest.yPosition - 1
    ) {
      if (e.character === "-") {
        return false;
      }
      return validateNext(e.character);
    }

    return false;
  });

  const possibleNext = [...possibleNextX, ...possibleNextY].filter((cor) => {
    const findIfPassed = passedCoordinates
      .filter((e) => e.file.filename === mapFile.filename)
      .filter((passedCor) => {
        if (
          passedCor.coordinates.xPosition === cor.xPosition &&
          passedCor.coordinates.yPosition === cor.yPosition
        ) {
          const collectTwice = isCollectedTwice(cSystem, passedCor.coordinates);
          if (
            collectTwice &&
            collectTwice.corToTest.xPosition ===
              passedCor.coordinates.xPosition &&
            collectTwice.corToTest.yPosition === passedCor.coordinates.yPosition
          ) {
            return false;
          }

          return true;
        } else {
          return false;
        }
      });

    if (findIfPassed.length) {
      return false;
    }

    return true;
  });

  // console.log(
  //   passedCoordinates.map((e) => e.coordinates),
  //   passedCoordinates.length,
  //   "AAAA"
  // );

  if (possibleNext.length) {
    // console.log(possibleNext, possibleNext.length);

    /*
    const collectTwice = isCollectedTwice(cSystem, possibleNext[0]);

    const passedOnce = passedOnceCoordinates.filter(
      (e) => e.file.filename === mapFile.filename
    )[0]?.coordinates;

    if (
      collectTwice &&
      collectTwice.corToTest &&
      JSON.stringify(collectTwice.corToTest) === JSON.stringify(possibleNext[0])
    ) {
      console.log(collectTwice);
      // result.push(collectTwice.corToTest.character);
      passedOnceCoordinates = [
        ...passedOnceCoordinates,
        { file: mapFile, coordinates: collectTwice.corToTest },
      ];
    }
*/

    possibleNext.forEach((e) => {
      const collectTwice = isCollectedTwice(cSystem, e);

      const passedOnce = passedOnceCoordinates
        .filter((el) => {
          if (el.file.filename === mapFile.filename) {
            return true;
          }
        })
        .map((el) => el.coordinates)[0];

      if (
        collectTwice &&
        collectTwice.corToTest &&
        JSON.stringify(collectTwice.corToTest) === JSON.stringify(e)
      ) {
        passedOnceCoordinates.push({
          file: mapFile,
          coordinates: collectTwice.corToTest,
        });
      }

      if (possibleNext.length === 1) {
        result.push(e.character);
        result2.push(e);

        passedCoordinates.push({ file: mapFile, coordinates: e });

        // result2.push(e.character);
      } else {
        const prev = result2[result2.length - 1];
        if (prev.character === e.character) {
          result.push(e.character);
          passedCoordinates.push({ file: mapFile, coordinates: e });
        } else {
          result.push(e.character);
          passedCoordinates.push({ file: mapFile, coordinates: e });
        }
      }
    });

    // result.push(possibleNext[0].character);

    /*
    passedCoordinates = [
      ...passedCoordinates,
      ...possibleNext
        .map((e) => {
          return { file: mapFile, coordinates: e };
        })
        .filter((e) => e),
    ];

*/

    possibleNext.forEach((cor) => {
      findPossibleNext(cSystem, cor, mapFile, result, result2);
    });
    return { result, result2 };
  } else {
    return { result, result2 };
  }
};

export const validateMap = (mapFile: MapFile) => {
  // contains lowercase letters except x
  if (/(?<![a-z])(?!x)[a-z]+/.test(mapFile.fileData)) {
    return false;
  }

  // contains numbers
  if (/[0-9]/.test(mapFile.fileData)) {
    return false;
  }

  const removeAlphanumericCharacters = mapFile.fileData.replace(
    /[a-zA-Z0-9]/g,
    ""
  );

  // convert string to array with charaters, filter and leave only valid ones
  const extraCharacters = removeAlphanumericCharacters.split("").filter((e) => {
    if (allowedSecialCharacters.includes(e)) return false;
    return true;
  });

  // has extra non allowed characters
  if (extraCharacters.length) {
    return false;
  }

  // missing start
  if (!mapFile.fileData.includes("@")) {
    return false;
  }

  // mising end
  if (!mapFile.fileData.includes("x")) {
    return false;
  }

  const arrayOfCharacters = mapFile.fileData.split("");

  // multiple starts
  if (arrayOfCharacters.filter((e) => e.includes("@")).length > 1) {
    return false;
  }

  // multiple ends
  if (arrayOfCharacters.filter((e) => e.includes("x")).length > 1) {
    return false;
  }

  return true;
};

export const convertToCoordinateSystem = (mapFile: MapFile) => {
  const arrayOfCharacters = mapFile.fileData.split("");
  // console.log(arrayOfCharacters);

  let coordinateSystem: CoordinateSystem = [];

  let xPosition = 0;
  let yPosition = 0;
  // find coordinates
  arrayOfCharacters.forEach((character, index) => {
    if (character === "\n") {
      // increment coordinates
      yPosition = yPosition - 1;
      // reset x position
      xPosition = 0;
    } else {
      xPosition = xPosition + 1;
      coordinateSystem[index] = { character, yPosition, xPosition };
    }
  });

  // remove null entries
  coordinateSystem = coordinateSystem.filter((e: CoordinatesObject) => e);

  return coordinateSystem;
};

export const walkOver = (cSystem: CoordinateSystem, mapFile: MapFile) => {
  const startCoordinates = cSystem.find((e) => e.character === "@");
  const endCoordinates = cSystem.find((e) => e.character === "x");

  const { result, result2 } = findPossibleNext(
    cSystem,
    startCoordinates,
    mapFile
  );

  // construct path as chars
  const pathAsCharacters =
    "@" + result.toString().replaceAll(",", "").split("x")[0] + "x";

  const letters = pathAsCharacters.replace(/[^A-Z]/g, "");

  const hasError = (() => {
    if (!result.toString().replaceAll(",", "").includes("x")) {
      return true;
    }
  })();

  return { pathAsCharacters, letters, hasError };
};

export const processFile = (mapFile: MapFile, failedFiles: string[]) => {
  Log.info("Map file name: " + mapFile.filename);
  Log.info("Map raw shape:");
  console.log(mapFile.fileData);

  if (!validateMap(mapFile)) {
    Log.error("Error while processing map " + mapFile.filename);
    failedFiles.push(mapFile.filename);
  } else {
    const cSystem = convertToCoordinateSystem(mapFile);
    // console.log(cSystem);

    const hasFakeTurn = findFakeTurn(cSystem);

    if (hasFakeTurn) {
      Log.error("Error while processing map " + mapFile.filename);
      failedFiles.push(mapFile.filename);
      return;
    }

    const { pathAsCharacters, letters, hasError } = walkOver(cSystem, mapFile);

    if (hasFakeTurn) {
      Log.error("Error while processing map " + mapFile.filename);
      failedFiles.push(mapFile.filename);
      return;
    }

    Log.info("Letters:");
    console.log(letters);
    console.log("");
    Log.info("Path as Characters:");
    console.log(pathAsCharacters);
  }

  console.log("");
};
