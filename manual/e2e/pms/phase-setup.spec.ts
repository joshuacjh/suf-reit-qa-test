import { test, expect } from "@playwright/test";
import { generatePhaseData } from "../utils/pms/createProjectData";
import { fillAllPhaseDetails } from "../utils/pms/phaseForm";
import { fillPhaseTeamMembers, processPhaseApproval } from "../utils/pms/phaseForm";
import { goToPage } from "../utils/pms/companyForm";

test.describe('PMS - Phase Setup', () => {
    test('1.0 Create new Phase form by enter all mandatory & optional fields and click on Submit button', async({ page }) => {
        await goToPage(page);

        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);

        await page.getByRole('link', { name: 'Open' }).first().click();
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: 'Add Project Management' }).click();

        // generate the phase data
        const phaseData = generatePhaseData();
        await fillAllPhaseDetails(page, phaseData);
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox').fill("Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
    })

    test('1.1 BUF PIC approves Phase creation submitted by PIC', async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
        await processPhaseApproval(page, {userName: 'Train User 23', approverRole: 'BU Finance PIC', approve: true});
    })

    test('1.2 SCCM PIC approves Phase creation submitted by PIC', async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
        await processPhaseApproval(page, {userName: 'Train User 22', approverRole: 'SCCM PIC', approve: true});
    })

    test('2.0 Create new Phase form by enter all mandatory & optional fields and click on Save as Draft button then click on Submit button', async({ page }) => {
        await goToPage(page);
        
        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);

        await page.getByRole('link', { name: 'Open' }).first().click();
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: 'Add Project Management' }).click();

        // generate the phase data
        const phaseData = generatePhaseData();
        await fillAllPhaseDetails(page, phaseData);
        // save the phase details
        await page.getByRole('button', { name: 'Save as Draft' }).click();
        await page.getByRole('button', { name: 'Ok' }).click();
        await page.waitForTimeout(3000);

        // submit the phase details
        await page.getByRole('row', { name: `${phaseData.phaseCode} ${phaseData.phaseName}` }).locator('#Action-2025-00023').click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox').fill("Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
    })

    test('2.1 SCCM PIC Rejects Phase creation submitted by PIC', async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
        await processPhaseApproval(page, {userName: 'Train User 1', approverRole: 'SCCM PIC', approve: false, comment: 'Reject'});
    })

    test('2.2 Return PIC to resubmit the Phase submission', async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        await page.getByRole('link', { name: ' Project Master Setup ' }).click();
        await page.waitForTimeout(3000);
        await page.getByRole('link', { name: ' Setup' }).click();
        await page.waitForTimeout(3000);
        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.getByRole('link', { name: 'Open' }).first().click();

        await page.waitForTimeout(3000);    // wait Phase - Project Management Screen to load

        // find the first rejected status
        const rejectedCell = page.getByRole('cell', { name: 'Rejected' }).first();
        // go up to that row
        const row = rejectedCell.locator('xpath=ancestor::tr');

        // get the rejected row phase code and phase name
        const phaseCode = await row.locator('td').nth(0).innerText();
        const phaseName = await row.locator('td').nth(1).innerText();
        
        // resubmit the phase details
        await page.getByRole('row', { name: `${phaseCode} ${phaseName}` }).locator('#Action-2025-00023').click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox').fill("Resubmit - Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
        await page.getByRole('button', { name: 'Ok' }).click();
    })

    test('2.3 SCCM PIC approves Phase creation submitted by PIC', async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
        await processPhaseApproval(page, {userName: 'Train User 1', approverRole: 'SCCM PIC', approve: true});
    })

    test('2.4 BUF PIC approves Phase creation submitted by PIC', async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
        await processPhaseApproval(page, {userName: 'Train User 2', approverRole: 'BU Finance PIC', approve: true});
    })

    test('Delete Phase - New Data', async({ page }) => {
        await goToPage(page);
        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);
        await page.getByRole('link', { name: 'Open' }).first().click();

        await page.waitForTimeout(3000);    // wait for Phase - Project Management screen to load out

        // Filter and check whether there are draft phase
        const draftCells = page.getByRole('cell', { name: 'Draft' });
        const count = await draftCells.count();
        if (count === 0){
            console.log('No Draft Phase found');
            throw new Error('No Draft Phase found');  // raise the issue and failed the test
        }

        // Otherwise, get first Draft row
        const draftRow = draftCells.first().locator('..') 
        await draftRow.locator('button.delete-phase').click();     // click delete phase button
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: 'Yes, delete it!'}).click();
        await page.getByRole('button', { name: 'Ok'}).click();  // confirmation dialog displayed
    })

    test('Add new member for New data under Team Member tab: Phase Level (Project Management Team Member)', async({ page }) => {
        await goToPage(page);
        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);
        await page.getByRole('link', { name: 'Open' }).first().click();

        await page.waitForTimeout(3000);    // wait for Phase - Project Management screen to load out

        // click on edit team members button & its corresponding tab
        await page.locator('button.edit-teammember').first().click();
        await page.getByRole("tab", {name: "Team Members"}).click();
        await page.waitForTimeout(3000);    // wait the team member screen to load out
        await fillPhaseTeamMembers(page);

        await page.waitForTimeout(3000);

        // save button
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Ok'}).click();
    })

    test('Able to delete member added under Phase Level (Project Management Team Member) for New data', async({ page }) => {
        await goToPage(page);
        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);
        await page.getByRole('link', { name: 'Open' }).first().click();

        await page.waitForTimeout(3000);    // wait for Phase - Project Management screen to load out

        // click on edit team members button & its corresponding tab
        await page.locator('button.edit-teammember').first().click();
        await page.getByRole("tab", {name: "Team Members"}).click();
        await page.waitForTimeout(3000);    // wait the team member screen to load out

        // find the delete button of last team members in the section
        const table = page.locator('#ProjMgmtTeam');
        const lastRow = table.locator('tbody tr').last();
        await lastRow.locator('.btn.btn-danger').click();
        
        // click yes and ok to delete it
        await page.getByRole('button', { name: 'Yes, delete it!' }).click();
        await page.getByRole('button', { name: 'Ok' }).click();
    })
})