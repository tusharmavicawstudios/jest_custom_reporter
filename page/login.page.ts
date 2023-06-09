import { Page } from "playwright";

export default class LoginPage {
    private page: Page;

    constructor(page: Page){
        this.page=page;
    }
    public get eleEmailTextField() {
       return this.page.$("input[name='email']");
    }
    public get elePassTextField() {
        return this.page.$("input[name='password']");
    }
    public get eleLoginBtn() {
        return this.page.$("//button[text()='LOGIN']");
    }

    public async enterUserName(name: string) {

        const ele =  await this.eleEmailTextField;
        await ele?.fill(name);

    }
    public async enterPassword(password: string) {

        const ele =  await this.elePassTextField;
        await ele?.fill(password);
    }
    public async clickLogin() {

        const ele =  await this.eleLoginBtn;
        await ele?.click();
    }
    public async login(username: string, pass: string){
        await this.enterUserName(username);
        await this.enterPassword(pass);
        await this.clickLogin();
    }
}