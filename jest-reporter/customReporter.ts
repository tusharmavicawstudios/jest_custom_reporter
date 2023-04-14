import type { TestResult } from '@jest/test-result';

const testResults: TestResult[] = [];

export default class CustomReporter {
  onTestResult(_test: any, result: TestResult):void {
    testResults.push(result);
  }
}
export function getTestResults(): TestResult[] {
    return testResults;
}