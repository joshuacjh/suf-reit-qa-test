import { test } from '@playwright/test';

test("SSO Login setup", async({ page }) => {
    await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate');

    // perform the sso login steps
})