import { Reporter, TestContext } from "@jest/reporters";
import { AggregatedResult } from "@jest/test-result";
import { _getCaseIds, publishTestResults } from "../test-runner";

type CustomReporter = Pick<Reporter, "onRunComplete">;

export default class TestReporter implements CustomReporter {
  constructor() {}

  onRunComplete(_: Set<TestContext>, results: AggregatedResult) {
    let testcaseids: any[] = [];
    const testCases = results.testResults[0].testResults;
  
    for (const testCase of testCases) {
      const ids = _getCaseIds(testCase);
      if (ids.length > 0) {
        testcaseids.push(...ids);
      }
    }
  
    if (testcaseids.length === 0) {
      console.log("No test case ids present, results can't be published.");
    } else {
      publishTestResults(results);
    }
  }
}

