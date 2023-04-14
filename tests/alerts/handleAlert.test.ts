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
         await page.goto('https://letcode.in/alert');
    })
    test('Handle dialogue box', async () => {
        const e = await page.$("#prompt");
        page.on('dialog',(dialog) => {
            console.log('Message: ' + dialog.message())
            console.log('type: ', + dialog.type());
            dialog.accept('hello world');
        })
        await e?.click();
    })
    // afterAll(async () => {
    //     await page.close();
    //     await context.close();
    //     await browser.close();
    // })
})