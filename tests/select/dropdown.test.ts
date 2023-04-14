import { Browser, BrowserContext, Page, chromium } from "@playwright/test";

describe ('handle input feilds',() => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    beforeAll(async () => {
        browser= await chromium.launch({
            headless:false
        });
         context = await browser.newContext();
         page= await context.newPage();
         await page.goto('https://letcode.in/dropdowns');
    })
    test('Handle dialogue box', async () => {
        await page.selectOption('#country','India');
        const text = await page.$eval<string,HTMLSelectElement>('#country',ele => ele.value)
        console.log(text);
        expect(text).toBe('India');
      })
    afterAll(async () => {
        await page.close();
        await context.close();
        await browser.close();
    })
})