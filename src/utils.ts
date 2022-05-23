import { CoordinateSystem, CoordinatesObject, MapFile } from "./types";
import { Log } from "./envSetup";

const allowedSecialCharacters = ["@", "+", "-", "|", " ", "\n"];
const validCharactersToJump = ["-"];
const notAllowedHorizontalAdvance = ["|"];
const notAllowedVerticalAdvance = ["-"];

const watchForForks = (
  prev: CoordinatesObject,
  next: CoordinateSystem,
  result: CoordinateSystem
) => {
  if (prev.character === "+" && next.length > 1) {
    let hasFork = false;
    const yNeighbours = next.filter(
      (e) =>
        (e.xPosition === prev.xPosition &&
          e.yPosition === prev.yPosition + 1) ||
        e.yPosition === prev.yPosition - 1
    );

    const xNeighbours = next.filter(
      (e) =>
        (e.yPosition === prev.yPosition &&
          e.xPosition === prev.xPosition + 1) ||
        e.xPosition === prev.xPosition - 1
    );

    if (yNeighbours.length === next.length) {
      hasFork = true;
    }
    if (xNeighbours.length === next.length) {
      hasFork = true;
    }
    if (hasFork) {
      result.push({
        character: "",
        xPosition: 0,
        yPosition: 0,
        error: true,
      });
      return;
    }
    return;
  }
  return;
};

export const findFakeTurn = (cSystem: CoordinateSystem) => {
  const hasErrors = cSystem
    .map((turnCoordinates) => {
      if (turnCoordinates.character === "+") {
        const xNeighbours = cSystem.filter((e) => {
          if (
            (e.xPosition === turnCoordinates.xPosition + 1 ||
              e.xPosition === turnCoordinates.xPosition - 1) &&
            e.yPosition === turnCoordinates.yPosition &&
            e.character !== " "
          ) {
            return e;
          }
        });

        // if + character has two adjacent values on the x-axis, then its a fake turn
        // no examples provided for y-axis, so not implemented
        const hasFakeTurn = xNeighbours.length > 1;

        if (hasFakeTurn) {
          return true;
        }
        return null;
      }
      return null;
    })
    .filter((e) => e);

  if (hasErrors.length) {
    return true;
  }
  return false;
};

// self explanitory
const calculateDirection = (
  pointOne: CoordinatesObject,
  pointTwo: CoordinatesObject
) => {
  if (!pointOne || !pointTwo) {
    return;
  }
  let direction = null;
  if (
    pointOne.xPosition > pointTwo.xPosition &&
    pointTwo.yPosition === pointOne.yPosition
  ) {
    direction = "left";
  }
  if (
    pointOne.xPosition < pointTwo.xPosition &&
    pointTwo.yPosition === pointOne.yPosition
  ) {
    direction = "right";
  }

  if (
    pointOne.yPosition > pointTwo.yPosition &&
    pointTwo.xPosition === pointOne.xPosition
  ) {
    direction = "down";
  }
  if (
    pointOne.yPosition < pointTwo.yPosition &&
    pointTwo.xPosition === pointOne.xPosition
  ) {
    direction = "up";
  }
  return direction;
};

const pushToResult = (value: CoordinatesObject, result: CoordinateSystem) => {
  const isAlreadyCollectedLetter = result.find(
    (e) =>
      /[A-Z]/.test(value.character) &&
      e.xPosition === value.xPosition &&
      e.yPosition === value.yPosition
  );
  // mark already collected letters
  if (isAlreadyCollectedLetter) {
    result.push({ ...value, alreadyCollected: true });
    return;
  }
  result.push(value);
  return;
};

const findPossibleNext = (
  cSystem: CoordinateSystem,
  coordinates: CoordinatesObject,
  result: CoordinateSystem = []
) => {
  const prev = result[result.length - 1];
  const prevPrev = result[result.length - 2];

  // stop execution when end character has been added
  if (prev.character === "x") {
    return;
  }

  const next = cSystem
    // filter out whitespace
    .filter((e) => e.character !== " ")
    // leave only possible (adjacent)  x, y coordinates
    .filter(
      (e) =>
        ([coordinates.yPosition + 1, coordinates.yPosition - 1].includes(
          e.yPosition
        ) &&
          e.xPosition === coordinates.xPosition) ||
        ([coordinates.xPosition + 1, coordinates.xPosition - 1].includes(
          e.xPosition
        ) &&
          e.yPosition === coordinates.yPosition)
    )
    // never go back one place
    .filter(
      (e) => !(e.xPosition === prev.xPosition && e.yPosition === prev.yPosition)
    )
    // never go back two places
    .filter(
      (e) =>
        !(
          e.xPosition === prevPrev?.xPosition &&
          e.yPosition === prevPrev?.yPosition
        )
    )
    // trim forbidden advance characters per direction
    .filter((e) => {
      const possibleDirection = calculateDirection(prev, e);
      if (!possibleDirection) {
        return true;
      }

      if (possibleDirection === "left") {
        return !notAllowedHorizontalAdvance.includes(e.character);
      }
      if (possibleDirection === "right") {
        return !notAllowedHorizontalAdvance.includes(e.character);
      }
      if (possibleDirection === "up") {
        return !notAllowedVerticalAdvance.includes(e.character);
      }
      if (possibleDirection === "down") {
        return !notAllowedVerticalAdvance.includes(e.character);
      }
    });

  // if only one possible option, take it
  if (next.length === 1) {
    pushToResult(next[0], result);
    findPossibleNext(cSystem, next[0], result);
    return result;
  } else {
    // find previous direction so we can try to keep going the same way
    const direction = calculateDirection(prevPrev, prev);

    let nextFound = false;

    if (direction === "right") {
      const nextRight = next.find(
        (e) =>
          e.xPosition === prev.xPosition + 1 &&
          e.yPosition === prev.yPosition &&
          !notAllowedHorizontalAdvance.includes(e.character)
      );
      if (nextRight) {
        nextFound = true;
        pushToResult(nextRight, result);
        findPossibleNext(cSystem, nextRight, result);
        return result;
      }
    }

    if (direction === "left") {
      const nextLeft = next.find(
        (e) =>
          e.xPosition === prev.xPosition - 1 &&
          e.yPosition === prev.yPosition &&
          !notAllowedHorizontalAdvance.includes(e.character)
      );
      if (nextLeft) {
        nextFound = true;
        pushToResult(nextLeft, result);
        findPossibleNext(cSystem, nextLeft, result);
        return result;
      }
    }

    if (direction === "down") {
      const nextDown = next.find(
        (e) =>
          e.yPosition === prev.yPosition - 1 &&
          e.xPosition === prev.xPosition &&
          !notAllowedVerticalAdvance.includes(e.character)
      );
      if (nextDown) {
        nextFound = true;
        pushToResult(nextDown, result);
        findPossibleNext(cSystem, nextDown, result);
        return result;
      }
    }

    if (direction === "up") {
      const nextUp = next.find(
        (e) =>
          e.yPosition === prev.yPosition + 1 &&
          e.xPosition === prev.xPosition &&
          !notAllowedVerticalAdvance.includes(e.character)
      );
      if (nextUp) {
        nextFound = true;
        pushToResult(nextUp, result);
        findPossibleNext(cSystem, nextUp, result);
        return result;
      }
    }

    // if no match found
    if (!nextFound) {
      const areNotPassed = next.filter(
        (e) =>
          !result.find(
            (res) =>
              e.xPosition === res.xPosition && e.yPosition === res.yPosition
          )
      );
      if (!areNotPassed.length) {
        // try do jump one field based on direction and character
        if (
          (direction === "down" || direction === "up") &&
          prev.character === "|"
        ) {
          const jumpOne = cSystem.find(
            (e) =>
              e.yPosition ===
                (direction === "down"
                  ? prev.yPosition - 1
                  : prev.yPosition + 1) && e.xPosition === prev.xPosition
          );
          const jumpTwo = cSystem.find(
            (e) =>
              e.yPosition ===
                (direction === "down"
                  ? prev.yPosition - 2
                  : prev.yPosition + 2) && e.xPosition === prev.xPosition
          );
          // jump only over allowed characters
          if (!validCharactersToJump.includes(jumpOne?.character)) {
            return;
          }

          if (jumpOne && jumpTwo) {
            nextFound = true;
            pushToResult(jumpOne, result);
            pushToResult(jumpTwo, result);
            findPossibleNext(cSystem, jumpTwo, result);
            return result;
          }
        }
        // LEFT and RIGHT are not implemented since no map examples were provided

        return;
      }

      watchForForks(prev, next, result);
      // next block is for debugging
      if (areNotPassed.length === 1) {
        nextFound = true;
        pushToResult(areNotPassed[0], result);
        findPossibleNext(cSystem, areNotPassed[0], result);
        return result;
      } else {
      }
    }
  }

  return result;
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

  // multiple ends (not requested, so not implemented)
  /*
  if (arrayOfCharacters.filter((e) => e.includes("x")).length > 1) {
    return false;
  }
  */

  return true;
};

export const convertToCoordinateSystem = (mapFile: MapFile) => {
  const arrayOfCharacters = mapFile.fileData.split("");

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

export const followMap = (cSystem: CoordinateSystem) => {
  const startCoordinates = cSystem.find((e) => e.character === "@");
  const result = findPossibleNext(cSystem, startCoordinates, [
    startCoordinates,
  ]);

  const resultString = result
    .map((e) => e.character)
    .toString()
    .replaceAll(",", "");

  // construct path as chars
  const pathAsCharacters = resultString;

  const letters = result
    .filter((e) => !e.alreadyCollected)
    .map((e) => e.character)
    .toString()
    .replaceAll(",", "")
    .replace(/[^A-Z]/g, "");

  const hasError = (() => {
    if (result.find((e) => e.error)) {
      return true;
    }

    if (!resultString.includes("x")) {
      return true;
    }

    return false;
  })();

  return { pathAsCharacters, letters, hasError };
};

export const processFile = (
  mapFile: MapFile,
  failedFiles: string[],
  skipPrint: boolean = false
) => {
  !skipPrint && Log.info("Map file name: " + mapFile.filename);
  !skipPrint && Log.info("Map raw shape: ");
  !skipPrint && Log.green(mapFile.fileData);

  if (!validateMap(mapFile)) {
    !skipPrint && Log.error("Error while processing map " + mapFile.filename);
    !skipPrint && Log.info("");
    !skipPrint && failedFiles.push(mapFile.filename);
    return { error: true };
  }
  const cSystem = convertToCoordinateSystem(mapFile);

  const hasFakeTurn = findFakeTurn(cSystem);
  if (hasFakeTurn) {
    !skipPrint && Log.error("Error while processing map " + mapFile.filename);
    !skipPrint && Log.info("");
    !skipPrint && failedFiles.push(mapFile.filename);
    return { error: true };
  }

  const { pathAsCharacters, letters, hasError } = followMap(cSystem);

  if (hasError) {
    !skipPrint && Log.error("Error while processing map " + mapFile.filename);
    !skipPrint && Log.info("");
    !skipPrint && failedFiles.push(mapFile.filename);
    return { error: true };
    return;
  }

  !skipPrint && Log.info("Letters:");
  !skipPrint && Log.blue(letters);
  !skipPrint && Log.info("");
  !skipPrint && Log.info("Path as Characters:");
  !skipPrint && Log.blue(pathAsCharacters);
  !skipPrint && Log.info("");
  return { error: false, letters, pathAsCharacters };
};
