import axios from 'axios';
import * as azureDevOps from 'azure-devops-node-api';
import * as Test from 'azure-devops-node-api/TestApi';
import * as fs from 'fs-extra';

interface TestResultsToTestRun {
  testResults: {
    id: number;
    testRunId: number;
  }[];
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

export async function publishTestResults(): Promise<void> {
  // Azure DevOps organization URL and personal access token
  const orgUrl = 'https://dev.azure.com/tusharmavi';
  const pat = 'xbcbfossn4f42sffr4rn73efh4sc4u7pvdltv775sntnm7gfidga';

  // Azure DevOps project and IDs for the test plan, test suite, and test case
  const project = 'tusharmavi';
  const testPlanId = '1';
  const testSuiteId = 2;
  const testCaseId = '4';

  const apiUrl = `${orgUrl}/${project}/_apis/test/points?api-version=7.0`;

const requestBody = {
  PointsFilter: {
    TestcaseIds: [3,4]
  },
};

axios.post(apiUrl, requestBody, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
  }
}).then((response) => {
  console.log(response.data);
}).catch((error) => {
  console.log(error);
});

  // Name for the test run and path to the Jest test results file
  const testRunName = 'should multiply';
  const resultFilePath = 'test-results.json';

  // Create an authentication handler using the personal access token
  const authHandler = azureDevOps.getPersonalAccessTokenHandler(pat);

  // Create a connection to the Azure DevOps organization
  const connection = new azureDevOps.WebApi(orgUrl, authHandler);
  const testRestApi = await connection.getTestApi();
  // const testPointsClient = await testRestApi.getTestPointsApi();

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

      // Read the contents of the Jest test results file as JSON
      const testResults = await fs.readJson(resultFilePath);

      // Upload the test results file as an attachment to the test run
      const attachmentRequest = {
        attachmentType: 'GeneralAttachment',
        fileName: 'test-results.json',
        stream: fs.readFileSync(resultFilePath, { encoding: 'base64' }),
      };
      await testApiObject.createTestRunAttachment(
        attachmentRequest,
        project,
        testRun.id
      );

      // Extract the test cases from the parsed JSON
      const testCases = testResults.testResults[0].testResults;

      console.log(testCases);
      const testResultsArray = [];

      // Convert the test cases to the format expected by the Test Results API
      for (const testCase of testCases) {
        const testResult = {
        testPoint: {id: '1'},
        outcome: testCase.status === 'passed' ? 'Passed' : 'Failed',
        durationInMs: testCase.duration,
        state: 'Completed',
        errorMessage: testCase.failureMessages?.[0],
      };
      testResultsArray.push(testResult);
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
      await testApiObject.addTestResultsToTestRun(
        testResultsArray,
        project,
        testRun.id
      );
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