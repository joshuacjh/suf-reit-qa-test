import { faker } from '@faker-js/faker';
import { Page, expect } from "playwright/test";
import { selectRandomDropdown } from '../selectDropDown';
import { readCompanyData } from '../pms/companyForm';
import { generateRandomNo } from './consultant-setup';

export function generateGeneralProfile(){
    const hasGST = faker.datatype.boolean();
    const hasSST = faker.datatype.boolean();
    const profileDate = faker.date.past({ years: 1 });
    const dateAppointment = faker.date.past({ years: 1});
    const today = new Date();
    const dateResign = faker.date.between({
        from: dateAppointment,
        to: today
    });

    return {
        industryType: '',
        typeOfCompany: '',
        creditTinNum: faker.string.alphanumeric(6),
        classificationCode: '',
        dateEstablished: formatDate(profileDate),
        gstEnabled: hasGST ? "Yes" : "No",
        gstRegNo: hasGST ? faker.string.numeric(12) : '',
        sstEnabled: hasSST ? "Yes" : "No",
        sstRegNo: hasSST ? faker.string.numeric(12) : '',

        // address section
        address: faker.location.streetAddress(),
        state: '',
        city: '',
        district: '',
        postcode: faker.location.zipCode("#####"),
        phoneNo: faker.string.numeric(9),

        // director section
        dirName: faker.person.fullName(),
        dirResidentialAddr: faker.location.streetAddress(),
        dirROC: faker.string.numeric(12),
        dateOfAppointment: formatDate(dateAppointment),
        dateOfResignation: formatDate(dateResign),

        // shareholder section
        shareholderName: faker.person.fullName(),
        shareholderROC: faker.string.numeric(12),
        shareholding: faker.string.numeric({length: 2, allowLeadingZeros: false}),

        // key management and staff
        staffName: faker.person.fullName(),
        designation: '',
        designRemarks: '',
        staffPhoneNo: faker.string.numeric(9),
        staffEmail: faker.internet.email(),
        principal: '',
    }
}

export function formatDate(date: Date){
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear();
  return `${day}/${month}/${year}`
}

export async function fillAllVendorDetails(page: Page, profileData: any) {
    /**
     * Company Particular Tab
     *  */ 
    const industryDropdown = await page.locator('.select2-selection__arrow').first();
    profileData.industryType = await selectRandomDropdown(page, industryDropdown);
    await page.waitForTimeout(3000);

    // pick random radio button
    const labels = ['Berhad', 'Sendirian Berhad', 'Partnership/Limited Liability Partnership', 'Sole Proprietory', 'Foreign Companies', 'Government / Authority'];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    // click and ensure the button being selected
    await page.getByRole('radio', { name: `${randomLabel}`, exact: true }).click();
    await expect(page.getByLabel(randomLabel, {exact: true})).toBeChecked();

    // date established
    await selectDateFromDatePicker(page, '#dateEstablished', profileData.dateEstablished);

    // gst registration
    if (profileData.gstEnabled === 'Yes'){
        await page.locator('#CPGSTRegistered1').click();
        // make sure the input field is enabled before filled in
        const gstInput = page.locator('#GSTTextbox');
        await expect(gstInput).toBeVisible();
        await expect(gstInput).toBeEnabled();
        await page.fill('#GSTTextbox', profileData.gstRegNo);
        await page.keyboard.press('Tab');
    } else {
        await page.locator('#CPGSTRegistered2').click();
    }

    await page.waitForTimeout(3000);

    // sst registration
    if (profileData.sstEnabled === 'Yes'){
        await page.locator('#CPSSTRegistered1').click();
        // make sure the input field is enabled before filled in
        const sstInput = page.locator('#SSTTextbox');
        await expect(sstInput).toBeVisible();
        await expect(sstInput).toBeEnabled();
        await page.fill('#SSTTextbox', profileData.sstRegNo);
        await page.keyboard.press('Tab');
    } else {
        await page.locator('#CPGSTRegistered2').click();
    }

    await page.waitForTimeout(3000);
    
    // registered address
    await page.locator('#showHideRADiv1').getByRole('button').click();
    await page.fill('#RAAddr1', profileData.address);
    const stateDropdown = await page.locator(
        '.row > div:nth-child(2) > .select2 > .selection > .select2-selection > .select2-selection__arrow > b'
    ).first();
    profileData.state = await selectRandomDropdown(page, stateDropdown);
    await page.waitForTimeout(3000);

    const cityDropdown = await page.locator(
        '.row > div:nth-child(3) > .select2 > .selection > .select2-selection > .select2-selection__arrow > b'
    ).first();
    profileData.city = await selectRandomDropdown(page, cityDropdown);
    await page.waitForTimeout(3000);

    const districtDropdown = await page.locator(
        '.form-group.col-xl-6 > .select2 > .selection > .select2-selection > .select2-selection__arrow > b'
    ).first();
    profileData.district = await selectRandomDropdown(page, districtDropdown);
    await page.waitForTimeout(3000);

    await page.fill('#RAPostcode', profileData.postcode);
    // click add button after filling in
    const addrDialog = page.locator('.modal-dialog', { hasText: 'Registered Address Details' });
    await page.getByRole('button', { name: 'Add' }).click();
    await addrDialog.waitFor({ state: 'hidden' });

    // Correspondence Address
    await page.locator('#corresAddRButton1').check();
    await page.fill('#CAOfficeNo', profileData.phoneNo);
     // click add button after filling in
    const addrCorDialog = page.locator('.modal-dialog', { hasText: 'Correspondence Address Details' });
    await page.getByRole('button', { name: 'Add' }).click();
    await addrCorDialog.waitFor({ state: 'hidden' });

    // Director
    await page.locator('textarea[name="GeneralInfo.CompanyParticular.CPDirector[0].CPDName"]').fill(profileData.dirName);
    await page.locator('textarea[name="GeneralInfo.CompanyParticular.CPDirector[0].CPDResidentialAdd"]').fill(profileData.dirResidentialAddr);
    await page.locator('input[name="GeneralInfo.CompanyParticular.CPDirector[0].CPDOldICNo_ROC_ROB"]').fill(profileData.dirROC);
    await page.waitForTimeout(3000);
    console.log(`Date Appointment: ${profileData.dateOfAppointment}`);
    await selectDateFromDatePicker(page, 'input[name="GeneralInfo.CompanyParticular.CPDirector[0].CPDDOA"]', profileData.dateOfAppointment);
    console.log(`Date Resignation: ${profileData.dateOfResignation}`)
    await selectDateFromDatePicker(page, 'input[name="GeneralInfo.CompanyParticular.CPDirector[0].CPDDOR"]', profileData.dateOfResignation);

    // Shareholder
    await page.locator('textarea[name="GeneralInfo.CompanyParticular.CPShareholder[0].CPSHName"]').fill(`${profileData.shareholderName}`);
    await page.locator('input[name="GeneralInfo.CompanyParticular.CPShareholder[0].CPSHOldICNo_ROC_ROB"]').fill(`${profileData.shareholderROC}`)
    await page.locator('input[name="GeneralInfo.CompanyParticular.CPShareholder[0].CPSHShareholding"]').fill(`${profileData.shareholding}`);

    await page.waitForTimeout(3000);

    /**
     * Key Management and Staff 
     */
    await page.getByRole('link', { name: 'Key Management and Staff' }).click();
    const rows = page.locator('#tbodykeyMgmt tr');
    const rowCount = await rows.count();
    if (rowCount === 0){
        await page.locator('#addKMS').click();
    }

    await page.fill('#KMSName0', profileData.staffName);
    const keyManagementDropdown = await page.locator(
        '#tbodykeyMgmt > tr > td:nth-child(4) > .select2 > .selection > .select2-selection > .select2-selection__arrow > b'
    ).first();
    profileData.designation = await selectRandomDropdown(page, keyManagementDropdown);
    await page.waitForTimeout(3000);

    await page.fill('#KMSDesignR0', 'N/A');
    await page.fill('#KMSEmail0', profileData.staffEmail);
    // hardcode - Yes since need at least one principal
    await page.locator(
        'td:nth-child(8) > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    ).first().click();
    await page.waitForTimeout(3000);
    await page.getByRole('option', { name: 'YES' }).click();

    await page.waitForTimeout(3000);
}

export async function selectDateFromDatePicker(page: Page, inputSelector: string, dateStr: string) {
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

export async function updateGeneralProfile(page: Page, profileData: any) {
    await page.fill('#CPCreditorTINNo', profileData.creditTinNum);

    // gst registration
    if (profileData.gstEnabled === 'Yes'){
        await page.locator('#CPGSTRegistered1').click();
        // make sure the input field is enabled before filled in
        const gstInput = page.locator('#GSTTextbox');
        await expect(gstInput).toBeVisible();
        await expect(gstInput).toBeEnabled();
        await page.fill('#GSTTextbox', profileData.gstRegNo);
        await page.keyboard.press('Tab');
    } else {
        await page.locator('#CPGSTRegistered2').click();
    }

    await page.waitForTimeout(3000);

    // sst registration
    if (profileData.sstEnabled === 'Yes'){
        await page.locator('#CPSSTRegistered1').click();
        // make sure the input field is enabled before filled in
        const sstInput = page.locator('#SSTTextbox');
        await expect(sstInput).toBeVisible();
        await expect(sstInput).toBeEnabled();
        await page.fill('#SSTTextbox', profileData.sstRegNo);
        await page.keyboard.press('Tab');
    } else {
        await page.locator('#CPGSTRegistered2').click();
    }

    await page.waitForTimeout(3000);
}

export async function loginVendor(page: Page, email: string, password = 'Password@1234') {
    await page.goto('https://sufreit-dev.sunway.com.my/external/SML/External/LoginRegistration')
    await page.waitForTimeout(3000);    // wait page to load
    await page.locator('#VendorEmailAddr2').fill(email);
    await page.locator('#VendorPassword2').click();
    await page.locator('#VendorPassword2').fill(password);
    await page.locator('#signInBtn').click();
}

export async function registerVendor(page: Page, companyName: string, email: string) {
    await page.goto('https://sufreit-dev.sunway.com.my/external/SML/External/LoginRegistration')
    await page.locator('#signUp').click();
    await page.fill('#VendorCompanyName', companyName);
    
    const rocNo = generateRandomNo();
    await page.fill('#VendorROCNo', rocNo);
    console.log(`Email: ${email}`)
    await page.fill('#VendorEmailAddr1', email);
    await page.fill('#VendorPassword1', 'Password@1234');
    // sign up
    await page.locator('#signUpBtn').click();

    await page.waitForTimeout(2000);

    // check whether register successfully
    const successMessage = page.getByText('Successfully Registered!');
    const existMessage = page.getByText('Company exist!');

    if (await successMessage.isVisible().catch(() => false)){
        console.log('Company registered successfully')
    }
    else if (await existMessage.isVisible().catch(() => false)){
        console.log('Company exist!')
    }
    else {
        throw new Error('Registration Failed')
    }
    await page.waitForTimeout(1000);
}

export interface Vendor {
    companyName: string;
    email: string;
}

export function getRegisteredVendor(): Vendor[] {
    const companies = readCompanyData();
    return companies.filter(comp => comp.registered === true)
        .map(comp => ({
            companyName: comp.companyName,
            email: comp.email
    }));
}

export function getRandomTestCompany(): Vendor {
    const companies = readCompanyData();

    if(!companies.length){
        throw new Error('No company available');
    }

    return companies[Math.floor(Math.random() * companies.length)]
}

export async function openGeneralProfile(page: Page): Promise<Page> {
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('cell', { name: 'Welcome to Vendor Management System.' }).first().click();
  const profilePage = await popupPromise;
  await profilePage.waitForLoadState('domcontentloaded');
  return profilePage;
}

export async function saveGeneralProfile(profilePage: Page) {
  await profilePage.getByRole('button', { name: 'Save as Draft' }).click();

  const dialog = profilePage.getByRole('dialog', { name: 'General Profile' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('saved as draft');
  await profilePage.getByRole('button', { name: 'Ok' }).click();
}

export async function submitGeneralProfile(profilePage: Page) {
  await profilePage.getByRole('button', { name: 'Submit' }).click();
  await profilePage.getByRole('button', { name: 'Yes' }).click();
  await profilePage.getByRole('button', { name: 'Accept' }).click();

  const dialog = profilePage.getByRole('dialog', { name: 'General Profile' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('submitted successfully');
  await profilePage.getByRole('button', { name: 'Ok' }).click();
}