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
         page.goto('https://letcode.in/edit');
    })
    test('enter your full name', async () => {
        await page.type("id=fullName","tushar mavi")
    })

    test("append a text and press keyboard tab", async () => {
        const join= await page.$('#join')
        await join?.focus();
        await page.keyboard.press('End');
        await join?.type(" Human")
    })
    test ("get text from inside the box", async () => {
        const text= await page.getAttribute('id=getMe','value');
        console.log(text);
    })

    test('clear value',async () => {
        await page.fill("//input[@value='Koushik Chatterjee']",'');
    })
    afterAll(async () => {
        await page.close();
        await context.close();
        await browser.close();
    })
})