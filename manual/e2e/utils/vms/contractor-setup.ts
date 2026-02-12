import { Page, expect } from "playwright/test";
import { faker } from '@faker-js/faker';
import { selectRandomDropdown } from '../selectDropDown';

export async function generateContractorProfile(page: Page){
    // Work Type
    const geoOperatingArea = page.getByRole('list').filter({ hasText: /^$/ });
    await selectRandomDropdown(page, geoOperatingArea);
    await page.waitForTimeout(3000);
}

export async function submitContractorProfile(page: Page) {
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByRole('button', { name: 'Yes' }).click()
    await page.getByRole('button', { name: 'Accept' }).click()
    await page.waitForTimeout(3000);
    const successDialog = page.getByRole('dialog', { name: 'Consultant Profile'});
    await expect(successDialog).toBeVisible();
    await expect(successDialog).toContainText('Consultant profile has been submitted successfully');
    await page.getByRole('button', { name: 'Ok' }).click();
}

export async function assignContractorPICAndAdmin(page: Page, selectedContractor: string, searchKey: string = 'edms') {
    await page.getByRole('button', { name: 'Train User 4' }).click();
    await page.getByRole('link', { name: ' VMS ' }).click();
    await page.getByRole('link', { name: 'Contractors List' }).click();
    await page.getByRole('searchbox', { name: 'Search:' }).click();
    await page.getByRole('searchbox', { name: 'Search:' }).fill(`${selectedContractor}`);    // MODIFIED IF NEEDED
    await page.getByRole('searchbox', { name: 'Search:' }).press('Enter');
    // click to check consultant information
    await page.getByRole('cell', { name: `${selectedContractor}` }).click();

    // assign pic
    await page.locator('.select2-selection__arrow').first().click();
    await page.getByRole('searchbox').nth(1).fill(`${searchKey}`);
    
    const selectedPIC = await page.getByRole('option', { name: 'eDMS Train User 3 - (Project' }).click();
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

export async function verifyContractorProfile(page: Page) {
    await page.getByRole('button', { name: 'Verify' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Approve - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Contractor Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Contractor profile has been verified successfully.');
            
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function acknowledgeContractorProfile(page: Page) {
    await page.getByRole('button', { name: 'Acknowledge' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.waitForTimeout(2000);
            
    // make sure it been acknowledge successfully by showing the dialog
    const acknowledgenDialog = page.getByRole('dialog', { name: 'Contractor Profile'});
    await expect(acknowledgenDialog).toBeVisible();
    await expect(acknowledgenDialog).toContainText('Contractor profile has been acknowledged successfully.');
    
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function rejectToAmendContractorProfile(page: Page) {
    await page.getByRole('button', { name: 'Reject To Amend' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Reject - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Contractor Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Contractor profile has been rejected successfully.');
            
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}

export async function resubmitContractorVendor(page: Page) {
    await page.getByRole('button', { name: 'Resubmit' }).click();
    await page.getByRole('button', { name: 'Yes' }).click()
    await page.getByRole('button', { name: 'Accept' }).click()
    
    // wait for success dialog to be pop out
    await page.waitForTimeout(3000);
    const successDialog = page.getByRole('dialog', { name: 'Contractor Profile'});
    await expect(successDialog).toBeVisible();
    await expect(successDialog).toContainText('Contractor profile has been submitted successfully');
    await page.getByRole('button', { name: 'Ok' }).click();
}

export async function rejectRequestContractorProfile(page: Page) {
    await page.getByRole('button', { name: 'Reject Request' }).click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('button', { name: 'Yes' }).click();
    await page.getByRole('textbox').fill("Reject - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    await page.waitForTimeout(3000);
    
    // make sure it been approved successfully by showing the dialog
    const confirmationDialog = page.getByRole('dialog', { name: 'Contractor Profile'});
    await expect(confirmationDialog).toBeVisible();
    await expect(confirmationDialog).toContainText('Request to update has been rejected successfully.');
    
    await page.getByRole('button', { name: 'Ok' }).click();     // close dialog
}


export async function openRejectedContractorProfile(page: Page): Promise<Page> {
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('cell', { name: 'Your request to update Contractor profile has been rejected by REIT.' }).first().click();
  const profilePage = await popupPromise;
  await profilePage.waitForLoadState('domcontentloaded');
  return profilePage;
}

export async function updateContractorProfile(page: Page) {
    // add new Work Type
    const geoOperatingArea = page.getByRole('list').filter({ hasText: /^$/ });
    await selectRandomDropdown(page, geoOperatingArea);
    await page.waitForTimeout(3000);
}

export async function updateVendorContractor(page: Page) {
    // click update button
    await page.getByRole('button', { name: 'Update' }).click()
    await page.getByRole('button', { name: 'Yes' }).click()
    await page.getByRole('button', { name: 'Accept' }).click()
    await page.waitForTimeout(3000);

    // fill in the comment
    await page.getByRole('textbox').fill("Updated - Done Automation Test");
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.waitForTimeout(3000);

    const successDialog = page.getByRole('dialog', { name: 'Contractor Profile'});
    await expect(successDialog).toBeVisible();
    await expect(successDialog).toContainText('Contractor profile has been updated successfully.');
    await page.getByRole('button', { name: 'Ok' }).click();
}