import { test } from "@playwright/test";
import { isCompanyRegistered, markCompanyRegistered, readCompanyData } from '../utils/pms/companyForm';
import { selectRandomVendor } from "../utils/selectDropDown";
import { fillAllVendorDetails, generateGeneralProfile, getRegisteredVendor, loginVendor, openGeneralProfile, registerVendor, saveGeneralProfile, submitGeneralProfile, updateGeneralProfile } from "../utils/vms/general-setup";

test.describe('VMS - General Profile', () => {
    let companyName: string;
    let email: string;

    test.beforeAll(() => {
        const companies = readCompanyData();
        if (companies.length === 0){
            throw new Error('No company available');
        }

        const randomCompany = companies[Math.floor(Math.random() * companies.length)];
        companyName = randomCompany.companyName;
        email = randomCompany.email;
    })

    test("PIC Request by clicks on Request to Update & Vendor Login External to Update", async({ page }) => {
        // Debug: evaluate and log registration status so we can see why the function may not be invoked
        const registered = isCompanyRegistered(email);
        console.log(`Pre-check isCompanyRegistered for ${email} -> ${registered}`);
        if (!registered){
            // register the company first and the general profile need submit first before able update
            console.log(`Registering company ${companyName} (${email})`);
            await registerVendor(page, companyName, email);
            await markCompanyRegistered(email);
            console.log(`Marked ${email} as registered`);
        }

        // then login External
        await loginVendor(page, email);
        await page.waitForTimeout(3000);    // wait External Notification page to load

        const profilePage = await openGeneralProfile(page);
        const profileData = await generateGeneralProfile();
        await fillAllVendorDetails(profilePage, profileData);
        // save and submit the profile
        await saveGeneralProfile(profilePage);
        await submitGeneralProfile(profilePage);

        // log out the External
        await loginVendor(page, email);
        await page.locator('#btnChangeUser').click();

        // then request update 
        await page.goto('https://sufreit-dev.sunway.com.my/SML/External/GeneralList');
        await page.getByRole('button', { name: 'Request To Update' }).click();
        await page.getByText('Existing General Vendor\'s').click();
        await page.getByRole('list').filter({ hasText: /^$/ }).click();

        // get those registered vendor company name
        const registeredVendor = getRegisteredVendor();
        console.log(`Registered vendors: ${registerVendor}`)
        const selectedVendor = await selectRandomVendor(page, registeredVendor);
        // get the selectedVendor company name and email
        console.log(`Vendor name: ${selectedVendor.companyName}`);
        console.log(`Vendor name: ${selectedVendor.email}`);

        await page.waitForTimeout(3000);    // wait for the backend to update
        await page.getByRole('button', { name: 'Send Email To Update' }).click();
        await page.getByRole('textbox').fill("Send Update Request Email - Done Automation Test");
        await page.getByRole('button', { name: 'Confirm' }).click();

        // login External
        await loginVendor(page, selectedVendor.email);
        
        await page.waitForTimeout(3000);    // wait External Notification page to load
        const pagePromise1 = page.waitForEvent('popup');     // wait for new browser tab to open
        await page.getByRole('cell', { name: 'Requested to update General profile by REIT.' }).first().click();

        await page.waitForTimeout(3000);    // wait general profile page to load
        const newPage = await pagePromise1;
        const phaseData = await generateGeneralProfile();
        await updateGeneralProfile(newPage, phaseData);
        // after update, save the updated profile
        await newPage.getByRole('button', { name: 'Save' }).click();
        await newPage.getByRole('button', { name: 'Yes' }).click();
        
        // accept the disclaimer dialog and wait for success dialog being load out
        await newPage.getByRole('button', { name: 'Accept' }).click();
        await newPage.waitForTimeout(3000);
    })

    test("Vendor General Profile Creation - Save as Draft button", async({ page }) => {
        if (!isCompanyRegistered(email)){
            // register the company first
            await registerVendor(page, companyName, email);
        }

        // then login External
        await loginVendor(page, email);
        await page.waitForTimeout(3000);    // wait External Notification page to load

        const profilePage = await openGeneralProfile(page);
        const profileData = await generateGeneralProfile();
        await fillAllVendorDetails(profilePage, profileData);
        await saveGeneralProfile(profilePage);
    })

    test("Vendor General Profile Creation - Submit button", async({ page }) => {
        if (!isCompanyRegistered(email)){
            // register the company first
            await registerVendor(page, companyName, email);
        }

        // then login External
        await loginVendor(page, email);
        await page.waitForTimeout(3000);    // wait External Notification page to load

        const profilePage = await openGeneralProfile(page);
        const profileData = await generateGeneralProfile();
        await fillAllVendorDetails(profilePage, profileData);
        await submitGeneralProfile(profilePage);
    })
})