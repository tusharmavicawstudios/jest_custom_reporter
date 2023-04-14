import { chromium } from "@playwright/test";



describe('upload file',() => {
    const filepath1= '../videos/a.webm';
    const filepath2= '../videos/b.webm';

    xtest('upload file using set input files', async () => {
        const browser = await chromium.launch(
            {headless: false}
        )
        const context= await browser.newContext();
        const page= await context.newPage();
        await page.goto('https://www.sendgb.com/') ;
        await page.setInputFiles('input[name= "qqfile"]',[filepath1,filepath2]);
        await page.close();
        await context.close();
        await browser.close();
    })

    test("upload using on function", async () => {
        const browser = await chromium.launch(
            {headless: false}
        )
        const context= await browser.newContext();
        const page= await context.newPage();
        await page.goto('https://the-internet.herokapp.com/upload') ;
        page.on('filechooser', async (filechooser) => {
            await filechooser.setFiles([filepath1,filepath2])

        })
        await page.click(".example + div#drag-drop-upload", { force:true })
    })
})