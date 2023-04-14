import * as azureDevOps from 'azure-devops-node-api';
import * as fs from 'fs-extra';

export async function publishTestResults(): Promise<void> {
  // Azure DevOps organization URL and personal access token
  const orgUrl = 'https://dev.azure.com/tusharmavi';
  const pat = 'xbcbfossn4f42sffr4rn73efh4sc4u7pvdltv775sntnm7gfidga';

  // Azure DevOps project and IDs for the test plan, test suite, and test case
  const project = 'tusharmavi';
  const testPlanId = "1";
  const testSuiteId = 2;

  // Name for the test run and path to the Jest test results file
  const testRunName = 'should multiply';
  const resultFilePath = 'test-results.json';

  // Create an authentication handler using the personal access token
  const authHandler = azureDevOps.getPersonalAccessTokenHandler(pat);

  // Create a connection to the Azure DevOps organization
  const connection = new azureDevOps.WebApi(orgUrl, authHandler);

  try {
    await (async function () {
      // Get the Test API object for the connection
      const testApiObject = await connection.getTestApi();

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
        fileName: 'test-results.json',
        stream: JSON.stringify(testResults),
      };
      // await testApiObject.createTestRunAttachment(
      //   attachmentRequest,
      //   project,
      //   testRun.id,
      // );

      // Extract the test cases from the parsed JSON
      const testCases = testResults.testResults[0].testResults;

      console.log(testCases);

      // Convert the test cases to the format expected by the Test Results API
      const testResultsArray = testCases.map((testCase: { title: string; status: string; duration: any; }) => ({
        outcome: testCase.status === 'passed' ? 'Passed' : 'Failed',
        durationInMs: testCase.duration,
        testCaseTitle: testCase.title,
      }));

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
