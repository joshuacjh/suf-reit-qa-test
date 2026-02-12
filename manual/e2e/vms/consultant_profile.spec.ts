import { test, expect } from '@playwright/test';
import path from 'path';
import { getRandomTestCompany, loginVendor } from '../utils/vms/general-setup';
import { acknowledgeConsultantProfile, approveRequestUpdateVendor, assignPICAndAdmin, generateConsultantData, generateConsultantProfile, openRejectedConsultantProfile, rejectRequestConsultantProfile, rejectToAmendConsultantProfile, requestUpdateVendor, resubmitVendor, submitConsultantProfile, updateConsultantProfile, updateVendorConsultant, verifyConsultantProfile } from '../utils/vms/consultant-setup';


const COMPANYDATA_FILE = path.resolve('playwright/.runtime/company.json');

test.describe.serial('VMS - Consultant Profile Test Scenario 1.0', () => {
    let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const company = getRandomTestCompany();
        companyName = company.companyName;
        email = company.email;
    })

    /**
     * Test 1.0
     */
    test("1.0 Vendor Submit Consultant Profile Creation - External", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        const consultantProfile = await generateConsultantData();
        await generateConsultantProfile(page, consultantProfile);
        await submitConsultantProfile(page);
    });

    test("1.1 Users able to assign PIC & Admin Approval for the Consultant Profile Submission with status = Pending Assign", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await assignPICAndAdmin(page, companyName);    
    });

    test("1.2 PIC able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("1.3 Admin able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 9' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    })

    test("1.4 Vendor to Acknowledge the Approved profile (Acknowledge button)", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        // click acknowlegde button
        await acknowledgeConsultantProfile(page);
    });
})

test.describe.serial('VMS - Consultant Profile Test Scenario 2.0', () => {
    let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const company = getRandomTestCompany();
        companyName = company.companyName;
        email = company.email;
    })

    /**
     * Test 2.0
     */
    test("2.0 Vendor Submit Consultant Profile Creation - External", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        const consultantProfile = await generateConsultantData();
        await generateConsultantProfile(page, consultantProfile);
        await submitConsultantProfile(page);
    });

    test("2.1 Users able to assign PIC & Admin Approval for the Consultant Profile Submission with status = Pending Assign", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await assignPICAndAdmin(page, companyName);  
    });

    test("2.2 PIC able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("2.3 Admin able to clicks on Reject to Amend button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 9' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click reject to amend button
        await rejectToAmendConsultantProfile(page);
    });

    test("2.4 Return to PIC to Resubmit on behalf by clicks on Verify button for the Rejected Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();   // need assign SCCM PIC for each company first
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify to resubmit the rejected consultant profile
        await verifyConsultantProfile(page);
    });

    test("2.5 Admin able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 9' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("2.6 Vendor to Acknowledge the Approved profile (Acknowledge button)", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        // click acknowlegde button
        await acknowledgeConsultantProfile(page);
    })
})

test.describe.serial('VMS - Consultant Profile Test Scenario 3.0', () => {
let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const company = getRandomTestCompany();
        companyName = company.companyName;
        email = company.email;
    });

    /**
     * Test 3.0
     */
    test("3.0 Vendor Submit Consultant Profile Creation - External", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        const consultantProfile = await generateConsultantData();
        await generateConsultantProfile(page, consultantProfile);
        await submitConsultantProfile(page);
    });

    test("3.1 Users able to assign PIC & Admin Approval for the Consultant Profile Submission with status = Pending Assign", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await assignPICAndAdmin(page, companyName);  
    });

    test("3.2 PIC able to clicks on Reject to Amend button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click reject to amend button
        await rejectToAmendConsultantProfile(page);
    });

    test("3.4 Return to Vendor to Resubmit", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        // click resubmit button
        await resubmitVendor(page);
    });

    test("3.5 Users able to assign PIC & Admin Approval for the Consultant Profile Submission with status = Pending Assign", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await assignPICAndAdmin(page, companyName);  
    });

    test("3.6 PIC able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("3.7 Admin able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 9' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("3.8 Vendor to Acknowledge the Approved profile (Acknowledge button)", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        // click acknowlegde button
        await acknowledgeConsultantProfile(page);
    });

})


test.describe.serial('VMS - Consultant Profile Test Scenario 4.0', () => {
    let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const company = getRandomTestCompany();
        companyName = company.companyName;
        email = company.email;
    });

    /**
     * Test 4.0
     */
    test("4.0 Vendor Submit Consultant Profile Creation - External", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        const consultantProfile = await generateConsultantData();
        await generateConsultantProfile(page, consultantProfile);
        await submitConsultantProfile(page);
    });

    test("4.1 Users able to assign PIC & Admin Approval for the Consultant Profile Submission with status = Pending Assign", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await assignPICAndAdmin(page, companyName);  
    });

    test("4.2 PIC able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("4.3 Admin able to clicks on Reject Request button to Rejects Permanently for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 9' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click reject request button
        await rejectRequestConsultantProfile(page);
    });

    test("4.4 Vendor to validate the Rejected profile", async({ page }) => {
        await loginVendor(page, email);
        await page.waitForTimeout(3000);    // wait External Notification page to load

        // validate rejected profile
        const profilePage = await openRejectedConsultantProfile(page);
        // ensure no submit button exists
        await expect(profilePage.getByRole('button', { name: 'Submit'})).not.toBeVisible();
    });
})

test.describe.serial('VMS - Consultant Profile Test Scenario 5.0', () => {
let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const company = getRandomTestCompany();
        companyName = company.companyName;
        email = company.email;
    });

    /**
     * Test 5.0
     */
    test("5.0 Update Consultant Profile - Vendor Login Request", async({ page }) => {
        await loginVendor(page, email);
        await page.waitForTimeout(3000);    // wait External Notification page to load

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        // click request to update button
        await requestUpdateVendor(page);
    });

    test("5.1 PIC able to clicks on Approve Request button", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await approveRequestUpdateVendor(page);
    });

    test("5.2 Vendor to update Consultant Profile", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        const consultantProfile = await generateConsultantData();
        await updateConsultantProfile(page, consultantProfile);

        // click update button
        await updateVendorConsultant(page);
    });

    test("5.3 PIC able to clicks on Verify button for the Consultant Profile update request", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 3' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("5.4 Admin able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {
        await page.goto("https://sufreit-dev.sunway.com.my/login/impersonate");
        await page.getByRole('button', { name: 'Train User 9' }).click();
        await page.getByRole('link', { name: ' VMS ' }).click();
        await page.getByRole('link', { name: 'Consultants List' }).click();
        await page.getByRole('button', { name: 'Pending Task' }).click();

        // search for the selected pending consultant
        await page.getByRole('searchbox', { name: 'Search:' }).fill(companyName);
        await page.waitForTimeout(3000);
        await page.getByRole('cell', { name: `${companyName}` }).click();

        // click verify button
        await verifyConsultantProfile(page);
    });

    test("5.5 Vendor to Acknowledge the Approved profile (Acknowledge button)", async({ page }) => {
        await loginVendor(page, email);

        await page.getByRole('link', { name: ' Profile Setting ' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('link', { name: 'Consultant' }).click();
        await page.waitForTimeout(3000);

        // click acknowlegde button
        await acknowledgeConsultantProfile(page);
    });

})

test.describe.serial('VMS - Consultant Profile Test Scenario 6.0', () => {
let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const company = getRandomTestCompany();
        companyName = company.companyName;
        email = company.email;
    });

    /**
     * Test 6.0
     */
    test("6.0 Update Consultant Profile - PIC Request by clicks on Request to Update", async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/SML/External/GeneralList');
        await page.getByRole('button', { name: 'Request To Update' }).click();
        await page.getByText('Existing Consultant\'s').click();
        await page.getByRole('list').filter({ hasText: /^$/ }).click();
        
        await page.locator('#showHideSelectBox3').getByRole('searchbox').fill(companyName);
        // wait for the dropdown options to load
        await page.waitForTimeout(1000);
        await page.getByRole('option', { name: `${companyName}` }).click();
        await page.waitForTimeout(1000);    // wait for the backend to update
        await page.getByRole('button', { name: 'Send Email To Update' }).click();
        await page.getByRole('textbox').fill("Send Update Request Email - Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
    });

    test("6.1 Update Consultant Profile - Vendor Login Request", async({ page }) => {   // TBC
        // login External
        await loginVendor(page, email);
        await page.waitForTimeout(3000);    // wait External Notification page to load
        const pagePromise = page.waitForEvent('popup');     // wait for new browser tab to open
        await page.getByRole('cell', { name: 'Requested to update Consultant profile by REIT.' }).first().click();

        await page.waitForTimeout(3000);    // wait consultant profile page to load
        const newPage = await pagePromise;
        const phaseData = await generateConsultantData();
        await updateConsultantProfile(newPage, phaseData);
        
        // after update, save the updated profile
        await newPage.getByRole('button', { name: 'Save' }).click();
        await newPage.getByRole('button', { name: 'Yes' }).click();
                
        // accept the disclaimer dialog and wait for success dialog being load out
        await newPage.getByRole('button', { name: 'Accept' }).click();
        await newPage.waitForTimeout(3000);
    });

    test("6.2 PIC able to clicks on Approve Request button", async({ page }) => {

    });

    test("6.3 Vendor to update Consultant Profile", async({ page }) => {

    });

    test("6.4 PIC able to clicks on Verify button for the Consultant Profile update request", async({ page }) => {

    });

    test("6.5 Admin able to clicks on Verify button for the Consultant Profile Submission", async({ page }) => {

    });

    test("6.6 Vendor to Acknowledge the Approved profile (Acknowledge button)", async({ page }) => {

    });

})

test.describe("VMS - Consultant Profile - Functional Test", () => {
    /**
     * Function test
     */
    test("User able to assign PIC for Mutiple Consultant Profile status = Pending Assign using Assign button", async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/SML/Consultant');

        // click first two cells to assign
        const cells = page.getByRole('cell');
        for (let i=0; i < 2; i++){
            await cells.nth(i).click();
        }

        // click Assign button and select the PIC
        await page.getByRole('button', { name: 'Assign' }).click();
        await page.getByRole('combobox', { name: 'Select PIC' }).locator('b').click();
        await page.getByRole('searchbox').nth(2).fill('edms');
        await page.getByRole('option', { name: 'eDMS Train User 3 - (PROJECT PIC)' }).click();

        // after done selecting, click Assign button
        await page.locator('#assignBulkBtn2').click(); 

        // make sure it been assigned successfully by showing the message
        await page.waitForTimeout(2000);    // wait message to be load 
        const assignedMessage = page.getByText('Assigned!');
        await expect(assignedMessage).toBeVisible();
                
        await page.getByRole('button', { name: 'Ok' }).click();     // close message
    });

    test("Able to change new PIC for New Data", async({ page }) => {
        await page.goto('https://sufreit-dev.sunway.com.my/SML/Consultant');
        // status = Pending for Verification
        await page.getByRole('cell', { name: "Pending For Verification" }).first().click();
        
        // click Assign button and select the PIC
        await page.getByRole('button', { name: 'Assign' }).click();
        await page.getByRole('combobox', { name: 'Select PIC' }).locator('b').click();
        await page.getByRole('searchbox').nth(2).fill('edms');
        await page.getByRole('option', { name: 'Train User 11 - (SCCM ADMIN)' }).click();

        // after done selecting, click Assign button
        await page.locator('#assignBulkBtn2').click(); 

        // make sure it been assigned successfully by showing the message
        await page.waitForTimeout(2000);    // wait message to be load 
        const assignedMessage = page.getByText('Assigned!');
        await expect(assignedMessage).toBeVisible();
                
        await page.getByRole('button', { name: 'Ok' }).click();     // close message
    });
    
});