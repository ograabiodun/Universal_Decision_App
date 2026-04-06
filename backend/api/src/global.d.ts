declare var process: any;

declare module '@azure/functions';
declare module '@azure/cosmos';
declare module 'openai';
declare module 'uuid';

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}
