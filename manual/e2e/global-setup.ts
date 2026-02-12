import { chromium } from "@playwright/test";

async function globalSetup() {
    // launch browser
    const browser = await chromium.launch({headless: false});
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://sufreit-dev.sunway.com.my/")
    // login manually once
    await page.waitForURL(/SML/, {
        timeout: 120_000,
    });
    // save the login session 
    await context.storageState({ path: "storageState.json"})
    await browser.close();
}

export default globalSetup;