export const Log = {} as any;

// fun with colors
Log.error = (...arg: any) => console.log("\x1b[31m%s", ...arg);
Log.info = (...arg: any) => console.log("\x1b[33m%s\x1b[0m", ...arg);
Log.green = (...arg: any) => console.log("\x1b[32m%s", ...arg);
Log.blue = (...arg: any) => console.log("\x1b[1m%s", ...arg);
