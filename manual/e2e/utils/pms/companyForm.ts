import { Page } from "playwright/test";
import { expect } from "@playwright/test";
import { selectRandomDropdown, isDuplicateCompanyCode } from "../selectDropDown";
import { faker } from "@faker-js/faker";
import fs from 'fs';
import path from 'path';

const COMPANYDATA_FILE = path.resolve(__dirname, '..', '..', '..', 'playwright', '.runtime', 'company.json');

export async function fillAllCompanyDetails(page: Page, companyData: any) {
    // fill the text fields
    await page.fill('#addCompanyName', companyData.companyName);
    // fill and validate whether company code exists
    await fillUniqueCompanyCode(page, companyData)

    // .first() - select the first matching element when locator finds multiple elements on the page
    const jdeDropdown = page.locator(
        '.form-group.col-xs-6.col-sm-6 > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    ).first();
    companyData.jdeEnvironment = await selectRandomDropdown(page, jdeDropdown);
    await page.waitForTimeout(3000);

    await page.fill('#addJDEIndustryType', companyData.jdeIndustryType);
    await page.fill('#addJDECompanyCode', companyData.jdeCompanyCode);
    await page.fill('#addJDEBusinessUnitCode', companyData.jdeBusinessCode);
    await page.locator('input[name="addRegNo"]').fill(companyData.registrationIDNo)

    // sst registration
    if (companyData.sstEnabled === "Yes"){
        await page.locator('#HasSST_Yes').click();
        await page.fill('input[placeholder="Enter SST Number"]', companyData.sstRegistrationNO);
    } else {
        await page.locator('#HasSST_No').click();
    }

    await page.fill('#addSecretKey1', companyData.secretKey1);
    await page.fill('#addSecretKey2', companyData.secretKey2);
    await page.fill('#addCreditorTINNo', companyData.tinNumber);

    await page.fill('input[placeholder="Address Line 1"]', companyData.address);

    const stateDropdown = page.locator(
        'div:nth-child(2) > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    ).first();
    companyData.state = await selectRandomDropdown(page, stateDropdown);
    await page.waitForTimeout(3000);
    
    const cityDropdown = page.locator(
        'div:nth-child(3) > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    )
    companyData.city = await selectRandomDropdown(page, cityDropdown);
    await page.waitForTimeout(3000);
    
    const districtDropdown = page.locator(
        'div:nth-child(7) > div > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    )
    companyData.district = await selectRandomDropdown(page, districtDropdown);
    await page.waitForTimeout(3000);

    await page.fill('#addPostcode', companyData.postcode);
    await page.fill('#addPhoneNo', companyData.phoneNo);
    await page.fill('#addEmail', companyData.emailAddr);
}

/**
 * Make sure the company code inputted not exists yet
 * @param page 
 * @param companyData 
 */
async function fillUniqueCompanyCode(page: Page, companyData: any){
  while (true){
    // fill the company code
    await page.fill('#addCompanyCode', companyData.companyCode);
    await page.waitForTimeout(3000);
    // check whether error is showing -> if no, then break loop
    if (!(await isDuplicateCompanyCode(page))) break;
    // if yes, then generate new one
    companyData.companyCode = faker.string.alpha(3).toUpperCase()
  } 
}

/**
 * 
 * @param page 
 */
export async function goToPage(page: Page){
    await page.goto('https://sufreit-dev.sunway.com.my/login/impersonate')
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await page.getByRole('link', { name: ' Project Master Setup ' }).click();
    await page.getByRole('link', { name: ' Setup' }).click();
    await page.waitForTimeout(3000);
}

/**
 * 
 * @param page 
 * @param companyData 
 */
export async function updateOptionalFields(page: Page, companyData: any) {
    await page.fill("#editGSTRegistrationNo", companyData.gstRegistrationNo);
    await page.waitForTimeout(3000);
    await page.fill("#editClientID", companyData.clientId);
    await page.waitForTimeout(3000);
}

/**
 * 
 * @param page 
 * @param companyData 
 */
export async function updateMandatoryFields(page: Page, companyData: any) {
    await page.fill('#editJDEBusinessUnitCode', companyData.jdeBusinessCode);
    await page.waitForTimeout(3000);
    await page.fill('#editRegNo', companyData.registrationIDNo)
    await page.waitForTimeout(3000);

    // sst registration
    if (companyData.sstEnabled === "Yes"){
        await page.locator('#HasSST_Yes').check();
        await page.fill('#editSSTRegistrationNo', companyData.sstRegistrationNO);
        await page.keyboard.press('Tab');
    } else {
        await page.locator('#HasSST_No').check();
    }
    await page.waitForTimeout(3000);

    await page.fill('#editPhoneNo', companyData.phoneNo);
    await page.waitForTimeout(3000);
    await page.fill('#editEmail', companyData.emailAddr);
    await page.waitForTimeout(3000);
}

/**
 * 
 * @param page 
 */
export async function editDraftRows(page: Page) {
    // ensure the table data being load out first
    await expect(page.getByText("Loading...")).toBeHidden();
    const draftCells = page.getByRole('cell', { name: 'Draft' });
    const count = await draftCells.count();

    // check whether there's exist Company status = Draft
    if (count === 0){
        console.log('No Draft Company found');
        throw new Error('No Draft company found');  // raise the issue and failed the test
    }

    // Otherwise, get first Draft row
    const draftRow = draftCells.first().locator('..')    
    await draftRow.getByTitle('Edit Company').click();

    await page.waitForTimeout(3000);    // wait for page to load
}

/**
 * 
 * @param page 
 */
export async function editCompleteRows(page: Page) {
    // ensure the table data being load out first
    const loadingText = page.getByText("Loading...");
    await expect(loadingText).toBeHidden();
    const completedRow = page.locator('table tbody tr').filter({ hasText: 'Completed' }).nth(1);
    await expect(completedRow).toBeVisible();
    // click edit team member button of that row
    await completedRow.getByTitle('Edit Team Member').click();
    
    await page.waitForTimeout(3000);    // wait for team members page to load
}

type MemberData = {
    role: string;
    selectedUser: string;
}

/**
 * 
 * @param page 
 * @param sectionAddButtonId 
 * @param dropdownLocator 
 * @returns 
 */
async function tryAddMemberOnce(page: Page, sectionAddButtonId: string, dropdownLocator: string): Promise<MemberData> {
    const memberData: MemberData = {
        role: '',
        selectedUser: '',
    };

    await page.click(`id=${sectionAddButtonId}`);
    // wait the dialog being pop out
    const dialog = page.getByRole('heading', { name: 'Add Member'});
    await expect(dialog).toBeVisible();

    // select role
    const roleDropdown = page.locator(dropdownLocator).first();
    await expect(roleDropdown).toBeVisible();
    memberData.role = await selectRandomDropdown(page, roleDropdown);
    await page.waitForTimeout(3000);

    // select user
    const userSearch = page.getByRole('searchbox', { name: 'Select user(s)' });
    await userSearch.click();
    await userSearch.fill('edms');

    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible();
    const randomIndex = Math.floor(Math.random() * await options.count());
    memberData.selectedUser = await options.nth(randomIndex).innerText();
    await options.nth(randomIndex).click();
    
    await page.waitForTimeout(3000);

    // save
    await page.getByRole('button', { name: 'Save' }).click();
    return memberData;
}

/**
 * 
 * @param page 
 * @param sectionAddButtonId 
 * @param dropdownLocator 
 * @param maxAttempts 
 * @returns 
 */
export async function addMemberInSection(page: Page, sectionAddButtonId: string, dropdownLocator: string, maxAttempts = 3): Promise<MemberData> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const memberData = await tryAddMemberOnce(page,sectionAddButtonId, dropdownLocator);

    // check for error dialog
    const errorDialog = page.locator('div').filter({ hasText: 'Unable to add User' }).nth(4);
    const hasError = await errorDialog.isVisible().catch(() => false);

    if (hasError) {
      await page.getByRole('button', { name: 'OK' }).click();
      continue;
    }

    // success path, so we wait dialog closed
    await expect(page.getByRole('dialog', { name: 'Add Member' })).toBeHidden();
    return memberData;
  }

  throw new Error('Unable to add member after multiple attempts');
}

export async function fillTeamMember(page: Page) {
    // Section 1: Management
    await addMemberInSection(page,'editMemRow', '.form-group.col-xs-9 > .select2 > .selection > .select2-selection > .select2-selection__arrow');

    // Section 2: Director
    await addMemberInSection(page, 'editDirRow', '#editDirMember > .modal-dialog > .modal-content > .modal-body > div > .form-group.col-xs-9 > .select2 > .selection > .select2-selection > .select2-selection__arrow');

    // Section 3: Tender Committee
    await addMemberInSection(page,'editComRow', '#editComMember > .modal-dialog > .modal-content > .modal-body > div > .form-group.col-xs-9 > .select2 > .selection > .select2-selection > .select2-selection__arrow');

    // click update and yes button
    await page.getByRole('button', { name: 'Update' }).click();
    await page.getByRole('button', { name: 'Yes' }).click();
}

export async function deleteTeamMember(page: Page, sectionDeleteButtonId: string) {
    await page.locator(`${sectionDeleteButtonId}`).first().click();
    // click yes and ok to delete it
    await page.getByRole('button', { name: 'Yes, delete it!' }).click();
    await page.getByRole('button', { name: 'Ok' }).click();
}

export function saveCompanyData(companyName: string, email: string){
    let data = { companies: [] as any[] };

    // check and read the existing file if it exists
    if (fs.existsSync(COMPANYDATA_FILE)) {
        data = JSON.parse(fs.readFileSync(COMPANYDATA_FILE, 'utf-8'));
    }
    
    const existing = data.companies.find((comp: any) => comp.email === email);
    if (!existing){
        data.companies.push({ companyName, email, registered: false });
    }

    fs.mkdirSync(path.dirname(COMPANYDATA_FILE), { recursive: true });
    fs.writeFileSync(COMPANYDATA_FILE, JSON.stringify(data, null, 2));  // null - dont modify/filter JSON, 2 - indent with 2 spaces
}

export function readCompanyData(){
    if (!fs.existsSync(COMPANYDATA_FILE)){
        return [];
    }
    const companyData = JSON.parse(fs.readFileSync(COMPANYDATA_FILE, 'utf-8'));

    // check whether there are companies exists in the file
    return Array.isArray(companyData.companies) ? companyData.companies : [];
}

export function isCompanyRegistered(email: string): boolean{
    // Debug: show which file we are reading to avoid cwd-related mismatches
    try {
        const companies = readCompanyData();
        const result = companies.some(comp => comp.email === email && comp.registered === true);
        console.log(`isCompanyRegistered(${email}) -> ${result} (file: ${COMPANYDATA_FILE})`);
        return result;
    } catch (err) {
        console.error('Error reading company data in isCompanyRegistered:', err);
        return false;
    }
}

export function markCompanyRegistered(email: string){
    if (!fs.existsSync(COMPANYDATA_FILE)) return;

    const companyData = JSON.parse(fs.readFileSync(COMPANYDATA_FILE, 'utf-8'));
    if (!Array.isArray(companyData.companies)) companyData.companies = [];
    const company = companyData.companies.find((comp: any) => comp.email === email);
    if (!company){
        throw new Error('Company not found');
    }
    company.registered = true;
    fs.writeFileSync(COMPANYDATA_FILE, JSON.stringify(companyData, null, 2));
}