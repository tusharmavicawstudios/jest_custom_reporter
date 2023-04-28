import * as azureDevOps from 'azure-devops-node-api';
import * as Test from 'azure-devops-node-api/TestApi';
import { TestPointsQuery } from 'azure-devops-node-api/interfaces/TestInterfaces';
import { azureTest } from './azure.config';

 export function _getCaseIds(test: any): string[] {
  const result: string[] = [];
  const regex = new RegExp(/\[([\d,\s]+)\]/, 'gm');
  const matchesAll = test.title.matchAll(regex);
  const matches = [...matchesAll].map((match) => match[1]);
  matches.forEach((match) => {
    const ids = match.split(',').map((id: string) => id.trim());
    result.push(...ids);
  });
  return result;
}

const _addReportingOverride = (api: Test.ITestApi): Test.ITestApi => {
  /**
   * Override the default behavior of publishing test results to the test run.
   * This is necessary because Microsoft Azure API documentation at version higher than '5.0-preview.5'
   * has undocumented fields and they not implementing at 'azure-devops-node-api/TestApi' package.
   * This function is downgraded the API version to '5.0-preview.5'.
   * https://github.com/microsoft/azure-devops-node-api/issues/318#issuecomment-498802402
   */
  api.addTestResultsToTestRun = function (results, projectName, runId) {
    return new Promise(async (resolve, reject) => {
      const routeValues = {
        project: projectName,
        runId,
      };

      try {
        const verData = await this.vsoClient.getVersioningData(
          '5.0-preview.5',
          'Test',
          '4637d869-3a76-4468-8057-0bb02aa385cf',
          routeValues
        );
        const url = verData.requestUrl;
        const options = this.createRequestOptions('application/json', verData.apiVersion);
        const res = await this.rest.create(url as string, results, options);
        resolve(res as any);
      } catch (error) {
        reject(error);
      }
    });
  };
  return api;
};

export async function publishTestResults(result: any): Promise<void> {
  // Azure DevOps organization URL and personal access token
  const orgUrl = azureTest.url;
  const pat = azureTest.token;

  // Azure DevOps project and IDs for the test plan, test suite, and test case
  const project = azureTest.projectname;
  const testPlanId = azureTest.test_Plan_Id;

  // Create an authentication handler using the personal access token
  const authHandler = azureDevOps.getPersonalAccessTokenHandler(pat);

  // Create a connection to the Azure DevOps organization
  const connection = new azureDevOps.WebApi(orgUrl, authHandler);

  
  const testRunName = result.testResults[0].testResults[0].ancestorTitles[0];

  try {
    await (async function () {
      // Get the Test API object for the connection
      const testApiObject = await connection.getTestApi();

      // Add the reporting override for the Test Results API
      _addReportingOverride(testApiObject);

      // Create the test run with the specified name, test plan ID, and test suite ID
      const testRun = await testApiObject.createTestRun(
        {
          name: testRunName,
          plan: { id: testPlanId },
          state: 'InProgress',
          configurationIds: [],
        },
        project
      );

      // Upload the test results file as an attachment to the test run
      // const attachmentRequest = {
      //   attachmentType: 'GeneralAttachment',
      //   fileName: 'test-results.json',
      //   stream: fs.readFileSync(resultFilePath, { encoding: 'base64' }),
      // };
      // await testApiObject.createTestRunAttachment(
      //   attachmentRequest,
      //   project,
      //   testRun.id
      // );

      // Extract the test cases from the parsed JSON
      const testCases = result.testResults[0].testResults;

      console.log(testCases);
      const testResultsArray = [];

      // Convert the test cases to the format expected by the Test Results API
      for (const testCase of testCases) {
        const testcaseid = _getCaseIds(testCase);
        console.log("these are test case id's: ", testcaseid)
        const convertedIds =  testcaseid.map(id => parseInt(id));
        console.log('converted answers: ',convertedIds);
        const pointsQuery: TestPointsQuery = {
          pointsFilter: {
            testcaseIds: convertedIds
          },
        };
        const pointsQueryResult = await testApiObject.getPointsByQuery(
          pointsQuery,
          project
        );

        console.log('testpoints after storing', pointsQueryResult.points);

        if (pointsQueryResult.points !== undefined) {
          const tp = pointsQueryResult.points[0].id;
          console.log(' this is testpoint id which i have got: ',tp);
          const testpointsid: string=tp.toString();
          const testResult = {
            testPoint: {id: testpointsid},
            outcome: testCase.status === 'passed' ? 'Passed' : 'Failed',
            durationInMs: testCase.duration,
            state: 'Completed',
            errorMessage: testCase.failureMessages[0]
              ? `${testCase.title}: ${testCase.failureMessages[0].replace(/\u001b\[.*?m/g, '') as string}`
              : undefined,
          };
          testResultsArray.push(testResult);
        } else {
          console.log('No test points found for the given IDs.');
        }
    }
    // Publish the test results to the test run if it's still in progress
    const testRunDetails = await testApiObject.getTestRunById(project, testRun.id);
    if (testRunDetails.state === 'InProgress') {
      const testRunUpdateModel = {
        state: 'Completed',
        completeDate: new Date(),
        testEnvironment: { name: 'default' },
        isAutomated: true,
        buildReference: { buildNumber: '1.0.0' },
      };
      const runResult = await testApiObject.addTestResultsToTestRun(
        testResultsArray,
        project,
        testRun.id
      );
      // console.log(runResult);
      await testApiObject.updateTestRun(
        testRunUpdateModel,
        project,
        testRun.id
        );
        console.log(`Test run "${testRunName}" completed successfully.`);
      }
    })();
  } catch (error) {
    console.error(error);
  }
}