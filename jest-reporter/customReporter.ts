import { Reporter, TestContext } from "@jest/reporters";
import { AggregatedResult } from "@jest/test-result";

type CustomReporter = Pick<Reporter, "onRunComplete">;

export default class TestReporter implements CustomReporter {
  constructor() {}

  onRunComplete(_: Set<TestContext>, results: AggregatedResult) {
    // console.log("This is custom reporter output : ", results.testResults[0].testResults);
    console.log("On run complete : ", _getCaseIds('[4] [5] [6] should add two numbers'));
  }
}
function _getCaseIds(TestCase: any): string[] {
  const result: string[] = [];
  const regex = new RegExp(/\[([\d,\s]+)\]/, 'gm');
  const matchesAll = TestCase.matchAll(regex);
  const matches = [...matchesAll].map((match) => match[1]);
  matches.forEach((match) => {
    const ids = match.split(',').map((id: string) => id.trim());
    result.push(...ids);
  });
  return result;
}
