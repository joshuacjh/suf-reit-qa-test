import { test, expect } from "@playwright/test";
import path from 'path';
import { generateCompanyProfileData } from "../utils/pms/createProjectData";
import { fillAllCompanyDetails, updateOptionalFields, updateMandatoryFields, goToPage, editDraftRows, editCompleteRows, fillTeamMember, deleteTeamMember, saveCompanyData } from "../utils/pms/companyForm";

const COMPANYDATA_FILE = path.resolve('playwright/.runtime/company.json');

test.describe("PMS - Company Setup", () => {
    test("Submit company with all mandatory + optional fields", async ({ page }) => {
        await goToPage(page);
        await page.getByRole("link", {name: " Add new Company"}).click()
        await page.getByRole("tab", {name: "Company Details"}).click()

        // start create company profile
        const companyData = generateCompanyProfileData();
        await fillAllCompanyDetails(page, companyData);

        // persist the generated data so that can be used for other test file
        saveCompanyData(companyData.companyName, companyData.emailAddr);

        // after fill in all fields, submit them, fill in comment and confirm
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox').fill("Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
    })

    test("Save company as draft with all mandatory + optional fields", async ({ page }) => {
        await goToPage(page);
        await page.getByRole("link", {name: " Add new Company"}).click()
        await page.getByRole("tab", {name: "Company Details"}).click()

        // start create company profile
        const companyData = generateCompanyProfileData();
        await fillAllCompanyDetails(page, companyData);

        // persist the generated data so that can be used for other test file
        saveCompanyData(companyData.companyName, companyData.emailAddr);

        // after fill in all fields, save them as draft 
        await page.getByRole('button', { name: 'Save as Draft' }).click();

        const confirmDialog = page.getByRole('dialog', { name: 'Saved' });
        await expect(confirmDialog).toBeVisible({ timeout: 30_000 });
        await page.getByRole('button', { name: 'Ok' }).click();     // confirmation dialog being pop out
    })

    test("Edit mandatory fields of existing company profile and save", async ({ page }) => {
        await goToPage(page);
        await editDraftRows(page);
        const companyData = generateCompanyProfileData();
        await updateMandatoryFields(page, companyData);

        // wait save button to be enabled and click save
        const saveDraftBtn = page.getByRole('button', { name: 'Save as Draft' });
        await expect(saveDraftBtn).toBeEnabled({ timeout: 10_000 });
        await saveDraftBtn.click();

        await page.waitForTimeout(3000);

        // ensure confirmation dialog being pop out
        const confirmDialog = page.getByRole('dialog', { name: 'Saved' });
        await expect(confirmDialog).toBeVisible({ timeout: 30_000 });
        await page.getByRole('button', { name: 'Ok' }).click();     // confirmation dialog being pop out
    })

    test("Edit optional fields of existing company profile and save", async ({ page }) => {
        await goToPage(page);
        await editDraftRows(page);
        const companyData = generateCompanyProfileData();
        await updateOptionalFields(page, companyData);
        // wait save button to be enabled and click save
        const saveDraftBtn = page.getByRole('button', { name: 'Save as Draft' });
        await expect(saveDraftBtn).toBeEnabled({ timeout: 10_000 });
        await saveDraftBtn.click();

        await page.waitForTimeout(3000);

        // ensure confirmation dialog being pop out
        const confirmDialog = page.getByRole('dialog', { name: 'Saved' });
        await expect(confirmDialog).toBeVisible({ timeout: 30_000 });
        await page.getByRole('button', { name: 'Ok' }).click();     // confirmation dialog being pop out
    })

    test("Edit mandatory + optional fields of existing company profile and save", async ({ page }) => {
        await goToPage(page);
        await editDraftRows(page);
        const companyData = generateCompanyProfileData();
        await updateMandatoryFields(page, companyData);
        await updateOptionalFields(page, companyData);
        // wait save button to be enabled and click save
        const saveDraftBtn = page.getByRole('button', { name: 'Save as Draft' });
        await expect(saveDraftBtn).toBeEnabled({ timeout: 10_000 });
        await saveDraftBtn.click();

        await page.waitForTimeout(3000);
        
        // ensure confirmation dialog being pop out
        const confirmDialog = page.getByRole('dialog', { name: 'Saved' });
        await expect(confirmDialog).toBeVisible({ timeout: 30_000 });
        await page.getByRole('button', { name: 'Ok' }).click();     
    })

    test("Add and save new team member under Management, Director and Tender Committee Members section", async({ page }) => {
        await goToPage(page);
        await editCompleteRows(page);
        await page.getByRole("tab", {name: "Team Members"}).click();
        await fillTeamMember(page);
        await page.getByRole('textbox').fill("Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
    })

    test("Delete and save team member under Management, Director and Tender Committee Members section", async({ page }) => {
        await goToPage(page);
        await editCompleteRows(page);
        await page.getByRole("tab", {name: "Team Members"}).click();
        // Section 1: Management
        await deleteTeamMember(page, '#editMemTeams > tbody > tr > td:nth-child(6) > .btn.btn-danger')

        // Section 2: Director
        await deleteTeamMember(page, '#editDirTeams > tbody > tr > td:nth-child(6) > .btn.btn-danger')

        // Section 3: Tender Committe
        await deleteTeamMember(page, '#editComTeams > tbody > tr > td:nth-child(6) > .btn.btn-danger')

        await page.waitForTimeout(3000);
        // click update and yes button to save
        await page.getByRole('button', { name: 'Update' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox').fill("Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();
    })

    test("Delete company", async({ page }) => {
        await goToPage(page);
        // ensure the table data being load out first
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();

        // check rows where company data status = completed
        const completeRow = page.locator('table tbody tr').filter({ hasText: 'Completed'});
        await expect(completeRow.first()).toBeVisible;
        // click delete button of that row
        await page.getByTitle('Delete Company').first().click();
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: 'Yes, delete it!'}).click();
        await page.getByRole('button', { name: 'Ok'}).click();  // confirmation dialog displayed
    })
})