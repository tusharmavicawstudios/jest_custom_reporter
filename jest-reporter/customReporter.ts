import { Reporter, TestContext } from "@jest/reporters";
import { AggregatedResult } from "@jest/test-result";

type CustomReporter = Pick<Reporter, "onRunComplete">;

export default class TestReporter implements CustomReporter {
  constructor() {}

  onRunComplete(_: Set<TestContext>, results: AggregatedResult) {
    // console.log("This is custom reporter output : ", results.testResults[0].testResults);
    // publishTestResults(results);
  }
}

