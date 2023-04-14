import Env from "../../utils/env";
import HeaderPage from "../../page/header.page";
import LoginPage from "../../page/login.page";
import CommonFunctions from "../../page/common.page";
import * as data from "../../data/login.cred.json";
import { Browser, BrowserContext, Page, chromium } from "playwright";

describe('TC001', () => {

    let browser:Browser;
    let context: BrowserContext;
    let page:Page;

    //mypages

    let header:  HeaderPage;
    let login: LoginPage;
    let common: CommonFunctions;
    beforeAll(async () => {
        browser = await chromium.launch({
            headless: false
        })  
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(Env.baseUrl);
        header = new HeaderPage(page);
        login = new LoginPage(page);
        common = new CommonFunctions(page);
    })
    test("Login positive", async () => {
        expect(page.url()).toBe('https://letcode.in/')
        await header.clickLoginLink();
        expect(page.url()).toBe('https://letcode.in/signin')
        await login.enterUserName(data.email);
        await login.enterPassword(data.password);
        await login.clickLogin();
        const toaster = await common.toaster;
        expect(await toaster?.textContent()).toContain("Welcome");
        await header.clickSignOutLink();
    })
})