declare module 'jest-json-reporter' {
    interface Report {
      numFailedTests: number;
      numFailedTestSuites: number;
      numPassedTests: number;
      numPassedTestSuites: number;
      numPendingTests: number;
      numPendingTestSuites: number;
      numRuntimeErrorTestSuites: number;
      numTotalTests: number;
      numTotalTestSuites: number;
      startTime: number;
      success: boolean;
      testResults: {
        message: any;
        status: string;
        console: null;
        failureMessage: string;
        numFailingTests: number;
        numPassingTests: number;
        numPendingTests: number;
        perfStats: {
          end: number;
          start: number;
        };
        skipped: boolean;
        snapshot: {
          added: number;
          fileDeleted: boolean;
          matched: number;
          unchecked: number;
          unmatched: number;
          updated: number;
        };
        sourceMaps: {};
        testFilePath: string;
        testResults: {
          ancestorTitles: string[];
          duration: number;
          failureMessages: string[];
          fullName: string;
          invocations: number;
          location: null;
          numPassingAsserts: number;
          status: string;
          title: string;
        }[];
        coverage?: {
          [key: string]: any;
        };
      }[];
      wasInterrupted: boolean;
    }
  
    export = Report;
  }
  