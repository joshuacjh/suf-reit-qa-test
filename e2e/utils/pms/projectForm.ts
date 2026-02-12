import { Page } from "playwright/test";
import { selectRandomDropdown } from "../selectDropDown";

export async function fillAllProjectDetails(page: Page, projectData: any) {
    const regionDropdown = page.locator(
        '.container-fluid > div > div > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    );
    projectData.regionDropdown = await selectRandomDropdown(page, regionDropdown);
    await page.waitForTimeout(3000);

    await page.fill('#ProjLocation', projectData.location);
    await page.fill('#ProjectName', projectData.projectName);
    await page.fill('#ProjectCode', projectData.projectCode);
    await selectDateFromDatePicker(page, '#StartDate', projectData.projectStartDate);
    await selectDateFromDatePicker(page, '#EndDate', projectData.projectEndDate);
    await page.fill('#EskerEmailAddress', 'testesker@sunway.com.my');
}

async function selectDateFromDatePicker(page: Page, inputSelector: string, dateStr: string) {
    const [day, month, year] = dateStr.split('/');
    const dayNumber = String(Number(day)); // convert Number type to remove leading zero

    // open date picker
    await page.locator(inputSelector).click();

    // open the year selector
    await page.getByRole('columnheader', { name: /January|February|March|April|May|June|July|August|September|October|November|December/ }).click();
    await page.getByRole('columnheader', { name: /\d{4}/ }).click();

    // select year
    await page.locator('span.year', { hasText: year }).click();

    // select month, make sure exact value
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    await page.getByText(monthNames[Number(month) - 1], {exact: true}).click();

    // select day, make sure exact value
    await page.locator('td.day:not(.old):not(.new)', { hasText: new RegExp(`^${dayNumber}$`) }).click();

    await page.waitForTimeout(3000);
}

export async function updateMandatoryFields(page: Page, projectData: any) {
    await page.fill('#ProjectName', projectData.projectName);
    await selectDateFromDatePicker(page, '#StartDate', projectData.projectStartDate);
    await selectDateFromDatePicker(page, '#EndDate', projectData.projectEndDate);
}