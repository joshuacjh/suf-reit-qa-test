import { test, expect } from "@playwright/test";
import { generateProjectData } from "../utils/pms/createProjectData";
import { fillAllProjectDetails, updateMandatoryFields } from "../utils/pms/projectForm";
import { goToPage } from "../utils/pms/companyForm";


test.describe("PMS - Project Setup", () => {
    test("Create new project setup by enter all mandatory fields and click on Save button", async({ page }) => {
        await goToPage(page);

        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.getByRole('button', { name: 'Add Project' }).click();
        
        const projectData = generateProjectData();
        console.log(projectData);
        await fillAllProjectDetails(page, projectData);
        // after fill in, save the details
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'OK' }).click();
    })

    test("Create new project setup by empty all or few of the mandatory fields only (without optional fields) and click on Save button", async({ page }) => {
        await goToPage(page);

        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.getByRole('button', { name: 'Add Project' }).click();

        // empty all mandatory fields and click save
        await page.getByRole('button', { name: 'Save' }).click();

        /**
         * Expected results: Each mandatory fields should have validation
         */
        // region
        const regionValidation = page.locator('#ProjRegion-error');
        await expect(regionValidation).toBeVisible();
        // location
        const locationValidation = page.locator('#ProjLocation-error');
        await expect(locationValidation).toBeVisible();
        // projectname
        const nameValidation = page.locator('#ProjectName-error');
        await expect(nameValidation).toBeVisible();
        // projectcode
        const codeValidation = page.locator('#ProjectCode-error');
        await expect(codeValidation).toBeVisible();
        // startdate
        const startValidation = page.locator('#StartDate-error');
        await expect(codeValidation).toBeVisible();
        // enddate
        const endValidation = page.locator('#EndDate-error');
        await expect(codeValidation).toBeVisible();
    });

    test("Edit/ Update new project profile (Status = Draft) at any fields and click on Save button", async({ page }) => {
        await goToPage(page);

        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);

        // check whether there are projects in draft version
        const draftCells = page.getByRole('cell', { name: 'Draft' });
        const count = await draftCells.count();
        if (count === 0){
            console.log('No Draft Project found');
            throw new Error('No Draft Project found');  // raise the issue and failed the test
        }

        // Otherwise, get first Draft row
        const draftRow = draftCells.first().locator('..') 
        await draftRow.locator('button.edit-proj').click();     // click edit project button
        await page.waitForTimeout(3000);    // wait for page to load  
        
        // create project data again
        const projectData = await generateProjectData();
        await updateMandatoryFields(page, projectData);
        // after fill in, save the details
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'OK' }).click();
    })

    test("Delete Project - New Data", async({ page }) => {
        await goToPage(page);
        
        // filter since only the company status = completed has project list
        const loadingText = page.getByText("Loading...");
        await expect(loadingText).toBeHidden();
        const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).first();
        await expect(completedRow).toBeVisible();

        await page.getByRole('link', { name: 'Project List' }).first().click();
        await page.waitForTimeout(3000);

        // check whether there are projects in draft version
        const draftCells = page.getByRole('cell', { name: 'Draft' });
        const count = await draftCells.count();
        if (count === 0){
            console.log('No Draft Project found');
            throw new Error('No Draft Project found');  // raise the issue and failed the test
        }

        // Otherwise, get first Draft row
        const draftRow = draftCells.first().locator('..') 
        await draftRow.locator('button.delete-proj').click();     // click delete project button
        await page.waitForTimeout(3000);
        await page.getByRole('button', { name: 'Yes, delete it!'}).click();
        await page.getByRole('button', { name: 'Ok'}).click();  // confirmation dialog displayed
    });
})