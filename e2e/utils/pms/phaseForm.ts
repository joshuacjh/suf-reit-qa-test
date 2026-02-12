import { Page } from "playwright/test";
import { expect } from "@playwright/test";
import { selectRandomDropdown } from "../selectDropDown";

export async function fillAllPhaseDetails(page: Page, phaseData: any) {
    await page.fill('#PhaseName', phaseData.phaseName);
    await page.fill('#PhaseCode', phaseData.phaseCode);

    const productTypeDropdown = page.locator(
        '.form-group.col-xs-12 > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    ).first();
    phaseData.productType = await selectRandomDropdown(page, productTypeDropdown);
    await page.waitForTimeout(3000);

    const phaseTitleDropdown = page.locator(
        '.container-fluid > div:nth-child(4) > .form-group > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    );
    phaseData.phaseTitle = await selectRandomDropdown(page, phaseTitleDropdown, ['Select Phase Title']);
    await page.waitForTimeout(3000);

    const gstTaxCodeDropdown = page.locator(
       'div:nth-child(5) > .form-group > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    );
    phaseData.gstTaxCode = await selectRandomDropdown(page, gstTaxCodeDropdown, ['Select GST Tax Code']);
    await page.waitForTimeout(3000);
}


export async function processPhaseApproval(
    page: Page, 
    {userName, approverRole, approve, comment = 'Accept - Done Automation Test'}: {userName: string, approverRole: 'SCCM PIC' | 'BU Finance PIC', approve: boolean, comment?: string}
) {
    const bufActionButton = approve? '#Action-2025-00047' : '#Action-2025-00048'
    const sccmActionButton = approve? '#Action-2025-00024' : '#Action-2025-00025'

    await page.getByRole('button', { name: userName, exact: true }).click();
    await page.getByRole('link', { name: ' Project Master Setup ' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: ' Setup' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('link', { name: 'Project List' }).first().click();
    await page.getByRole('link', { name: 'Open' }).first().click();

    await page.waitForTimeout(3000);    // wait Phase - Project Management Screen to load

    // check cells that consist status = Pending Approval
    const pendingCells = page.getByRole('cell', { name: 'Pending Approval' });
    const count = await pendingCells.count();

    let approved = false;
    for (let i = 0; i < count; i++){
        const cell = pendingCells.nth(i);
        const row = cell.locator('xpath=ancestor::tr');     // from this cell, go up until find the table row <tr>
        
        // get the current row phase code and phase name
        const phaseCode = await row.locator('td').nth(0).innerText();
        const phaseName = await row.locator('td').nth(1).innerText();

        await cell.getByText('Pending Approval', { exact: true }).click();
        await page.waitForTimeout(3000);
            
        // wait dialog to appear
        const dialog = page.locator('.modal-dialog', {hasText: 'Approvals'});
        await dialog.waitFor({ state: 'visible'});

        // check whether actually pending for approver
        const sccmRow = dialog.getByRole('cell', { name: approverRole , exact: true }).locator('xpath=ancestor::tr');

        // check the status inside the dialog
        const isPending = await sccmRow.getByRole('cell', {name: 'Pending for Approval'}).isVisible().catch(() => false);

        // check if no approver pending, close this dialog and skip the row
        if (!isPending){
            // close the dialog
            await dialog.getByRole('button', { name: 'Close'}).click();
            await dialog.waitFor({ state: 'hidden' });
            continue;
        }

        // approver exists and is pending, then close the dialog and approve
        await page.getByRole('button', { name: 'Close'}).click();
        await dialog.waitFor({ state: 'hidden' });
        // approve/reject button
        if (approverRole === 'SCCM PIC'){
            await page.getByRole('row', { name: `${phaseCode} ${phaseName}` }).locator(`${sccmActionButton}`).click();
        }
        if (approverRole === 'BU Finance PIC'){
            await page.getByRole('row', { name: `${phaseCode} ${phaseName}` }).locator(`${bufActionButton}`).click();
        }
        await page.getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox').fill(`${comment}`);
        await page.getByRole('button', { name: 'Confirm' }).click();

        // wait a while for success dialog to load
        await page.waitForTimeout(3000);
        await page.getByRole('button', {name: 'Ok'}).click();

        approved = true;
        break;
    }

    if (!approved){
        throw new Error(`No Pending Approval found for ${approverRole}`)
    }
}

type MemberData = {
    role: string;
    selectedUser: string;
}

export async function fillPhaseTeamMembers(page: Page) {
    const memberData: MemberData = {
        role: '',
        selectedUser: ''
    };

    await page.click('id=phaseMemRow');
    // wait the dialog to be pop out
    const dialog = page.getByRole('heading', { name: 'Add Member'});
    await expect(dialog).toBeVisible();

    await page.pause();

    // select the role
    const roleDropdown = page.locator(
        '#phaseMemMember > .modal-dialog > .modal-content > .modal-body > div > .form-group.col-xs-9 > .select2 > .selection > .select2-selection > .select2-selection__arrow'
    ).first();
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
    await page.locator('#phaseMemSave').click();
}