import { Page, expect } from "playwright/test";
import { faker } from '@faker-js/faker';
import { formatDate, selectDateFromDatePicker } from "./general-setup";
import { selectRandomDropdown } from '../selectDropDown';

export async function generateConsultantData() {
    // Technical Compentencies
    const conServiceYear = faker.date.past({ years: 1});
    const today = new Date();
    const conServiceDate = faker.date.between({
        from: conServiceYear,
        to: today
    });

    return{
        serviceDate: formatDate(conServiceDate),
        geoOperateArea: '',
    }
}

export async function generateConsultantProfile(page: Page, consultantData: any){
    // Technical Compentencies
    await page.getByRole('link', { name: 'Technical Competencies' }).click();
    await selectDateFromDatePicker(page, 'input[name="Consultant.TechnicalCompentencies.StaffTechCompentencies[0].ServiceYearSince"]', consultantData.serviceDate);

    // Consultancy Services
    const consultancyTab = page.locator('a[data-bs-toggle="tab"]:has-text("Type of Consultancy Service"):visible');
    if (!(await consultancyTab.isVisible())){
        await page.getByRole('link', { name: 'More' }).click();
    }
    await consultancyTab.click();

    // Work Type
    const geoOperatingArea = page.getByRole('list').filter({ hasText: /^$/ });
    consultantData.geoOperateArea = await selectRandomDropdown(page, geoOperatingArea);
    await page.waitForTimeout(3000);

    // Company Resources
    const resourceTab = page.locator('a[data-bs-toggle="tab"]:has-text("Company Resources"):visible');
    if (!(await resourceTab.isVisible())){
        await page.getByRole('link', { name: 'More' }).click();
    }
    await resourceTab.click();
    await page.locator('#addConsultantSoftware').click();
    await page.getByRole('textbox').fill('Sunway App');

    // ISO 9001 Certificate
    const isoTab = page.locator('a[data-bs-toggle="tab"]:has-text("ISO 9001 Certificate"):visible');
    if (!(await isoTab.isVisible())){
        await page.getByRole('link', { name: 'More' }).click();
    }
    await isoTab.click();
    await page.getByRole('radio', { name: 'No', exact: true }).check();

    // Project Quality Plan
    const proQualityTab = page.locator('a[data-bs-toggle="tab"]:has-text("Project Quality Plan"):visible');
    if (!(await proQualityTab.isVisible())) {
        await page.getByRole('link', { name: 'More' }).click();
    }
    await proQualityTab.click();

    // hardcode - select minimum 5 checkboxes
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_0__IsSelected').check();
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_2__IsSelected').check();
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_4__IsSelected').check();
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_5__IsSelected').check();
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_6__IsSelected').check();
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_10__IsSelected').check();
}

export async function updateConsultantProfile(page: Page, consultantData: any) {
    // Technical Compentencies
    await page.getByRole('link', { name: 'Technical Competencies' }).click();
    await selectDateFromDatePicker(page, 'input[name="Consultant.TechnicalCompentencies.StaffTechCompentencies[0].ServiceYearSince"]', consultantData.serviceDate);

    // Consultancy Services
    const consultancyTab = page.locator('a[data-bs-toggle="tab"]:has-text("Type of Consultancy Service"):visible');
    if (!(await consultancyTab.isVisible())){
        await page.getByRole('link', { name: 'More' }).click();
    }
    await consultancyTab.click();
    const geoOperatingArea = page.getByRole('list').filter({ hasText: /^$/ });
    consultantData.geoOperateArea = await selectRandomDropdown(page, geoOperatingArea);
    await page.waitForTimeout(3000);

    // update by clicking two more checkbox
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_1__IsSelected').check();
    await page.locator('#Consultant_ProjectQualityPlan_ProjectQualities_3__IsSelected').check();
}


export async function assignPICAndAdmin(page: Page, selectedConsultant: string, searchKey: string = 'edms') {
    await page.getByRole('button', { name: 'Train User 4' }).click();
    await page.getByRole('link', { name: ' VMS ' }).click();
    await page.getByRole('link', { name: 'Consultants List' }).click();
    await page.getByRole('searchbox', { name: 'Search:' }).click();
    await page.getByRole('searchbox', { name: 'Search:' }).fill(`${selectedConsultant}`);    // MODIFIED IF NEEDED
    await page.getByRole('searchbox', { name: 'Search:' }).press('Enter');
    // click to check consultant information
    await page.getByRole('cell', { name: `${selectedConsultant}` }).click();

    // assign pic
    await page.locator('.select2-selection__arrow').first().click();
    await page.getByRole('searchbox').nth(1).fill(`${searchKey}`);
    
    const selectedPIC = await page.getByRole('option', { name: 'eDMS Train User 3 - (Project PIC)' }).click();
    console.log('Selected PIC: ', selectedPIC);    
    await page.waitForTimeout(3000);

    // assign admin
    await page.locator(
        '.input-group > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    ).first().click();
    await page.getByRole('searchbox').nth(1).fill(`${searchKey}`);

    const selectedAdmin = await page.getByRole('option', { name: 'eDMS Train User 9 - (SCCM ADMIN (ME))' }).click();
    console.log('Selected Admin: ', selectedAdmin);
    await page.waitForTimeout(3000);

    // click assign button
    await page.locator('#assignBtn').click();
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'OK' }).click();
}

export function generateRandomNo(): string {
    return faker.string.numeric(12);
}

export async function submitConsultantProfile(page: Page) {
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByRole('button', { name: 'Yes' }).click()
    await page.getByRole('button', { name: 'Accept' }).click()
    await page.waitForTimeout(3000);
    const successDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(successDialog).toBeVisible();
    await expect(successDialog).toContainText('Consultant profile has been submitted successfully');
    await page.getByRole('button', { name: 'Ok' }).click();
}

export async function verifyConsultantProfile(page: Page) {
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Approve - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Consultant profile has been verified successfully.');
            
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function acknowledgeConsultantProfile(page: Page) {
    await page.getByRole('button', { name: 'Acknowledge' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(2000);
            
    // make sure it been acknowledge successfully by showing the dialog
    const acknowledgenDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(acknowledgenDialog).toBeVisible();
    await expect(acknowledgenDialog).toContainText('Consultant profile has been acknowledged successfully.');
    
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function rejectToAmendConsultantProfile(page: Page) {
    await page.getByRole('button', { name: 'Reject To Amend' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Reject - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Consultant profile has been rejected successfully.');
            
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function rejectRequestConsultantProfile(page: Page) {
    await page.getByRole('button', { name: 'Reject Request' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Reject - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Request to update has been rejected successfully.');
    
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function resubmitVendor(page: Page) {
    await page.getByRole('button', { name: 'Resubmit' }).click();
    await page.getByRole('button', { name: 'Yes' }).click()
    await page.getByRole('button', { name: 'Accept' }).click()
    
    // wait for success dialog to be pop out
    await page.waitForTimeout(3000);
    const successDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(successDialog).toBeVisible();
    await expect(successDialog).toContainText('Consultant profile has been submitted successfully');
    await page.getByRole('button', { name: 'Ok' }).click();
}

export async function openRejectedConsultantProfile(page: Page): Promise<Page> {
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('cell', { name: 'Your request to update Consultant profile has been rejected by REIT.' }).first().click();
  const profilePage = await popupPromise;
  await profilePage.waitForLoadState('domcontentloaded');
  return profilePage;
}

export async function requestUpdateVendor(page: Page) {
    await page.getByRole('button', { name: 'Request To Update' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Request Update - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Request to update has been submitted.');
            
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function approveRequestUpdateVendor(page: Page) {
    await page.getByRole('button', { name: 'Approve Request' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Request to update has been approved successfully.');
            
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function updateVendorConsultant(page: Page) {
    // click update button
    await page.getByRole('button', { name: 'Update' }).click()
    await page.getByRole('button', { name: 'Yes' }).click()
    await page.getByRole('button', { name: 'Accept' }).click()
    await page.waitForTimeout(3000);

    // fill in the comment
    await page.getByRole('textbox').fill("Updated - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(3000);

    const successDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(successDialog).toBeVisible();
    await expect(successDialog).toContainText('Consultant profile has been updated successfully.');
    await page.getByRole('button', { name: 'Ok' }).click();
}