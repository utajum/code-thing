export type CoordinatesObject = {
  character: string;
  yPosition: number;
  xPosition: number;
  alreadyCollected?: boolean;
  error?: boolean;
};

export type CoordinateSystem = Array<CoordinatesObject>;

export type MapFile = { filename: string; fileData: string };
