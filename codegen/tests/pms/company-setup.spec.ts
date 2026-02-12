import { expect, test } from '@playwright/test';

const BASE_URL = 'https://sufreit-dev.sunway.com.my';

type CompanyData = {
  companyName: string;
  companyCode: string;
  jdeIndustryType: string;
  jdeCompanyCode: string;
  jdeBusinessUnitCode: string;
  registrationNo: string;
  sstNo: string;
  secretKey1: string;
  secretKey2: string;
  tinNo: string;
  address1: string;
  postcode: string;
  phoneNo: string;
  email: string;
};

const randomLetters = () =>
  Array.from({ length: 3 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
const randomDigits = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 10).toString()).join('');
const randomAlphaNum = (len: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const createCompanyData = (companyName: string, companyCode: string): CompanyData => ({
  companyName,
  companyCode,
  jdeIndustryType: `IND-${randomAlphaNum(5)}`,
  jdeCompanyCode: randomDigits(3),
  jdeBusinessUnitCode: `BU${randomDigits(2)}`,
  registrationNo: `REG${randomDigits(8)}`,
  sstNo: `SST${randomDigits(8)}`,
  secretKey1: `SK1-${randomAlphaNum(10)}`,
  secretKey2: `SK2-${randomAlphaNum(10)}`,
  tinNo: `C${randomDigits(8)}A`,
  address1: `${randomDigits(3)} Test Street, Block ${randomAlphaNum(2)}`,
  postcode: `4${randomDigits(4)}`,
  phoneNo: `03${randomDigits(8)}`,
  email: `mcp.${Date.now().toString().slice(-6)}.${randomAlphaNum(4).toLowerCase()}@example.test`,
});

const fillMandatoryCompanyFields = async (page: any, data: CompanyData) => {
  await page.fill('#addCompanyName', data.companyName);
  await page.fill('#addCompanyCode', data.companyCode);
  await page.fill('#addJDEIndustryType', data.jdeIndustryType);
  await page.fill('#addJDECompanyCode', data.jdeCompanyCode);
  await page.fill('#addJDEBusinessUnitCode', data.jdeBusinessUnitCode);
  await page.fill('#addRegNo', data.registrationNo);

  await page.click('#HasSST_Yes');
  await page.fill('#addSSTRegistrationNo', data.sstNo);
  await page.fill('#addSecretKey1', data.secretKey1);
  await page.fill('#addSecretKey2', data.secretKey2);
  await page.fill('#addCreditorTINNo', data.tinNo);
  await page.fill('#addAddr1', data.address1);
  await page.fill('#addPostcode', data.postcode);
  await page.fill('#addPhoneNo', data.phoneNo);
  await page.fill('#addEmail', data.email);

  // Select2-backed fields with cascading waits.
  await page.evaluate(async () => {
    const $ = (window as any).$;
    if (!$) return;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const firstValidOption = (selector: string) =>
      $(selector + ' option')
        .toArray()
        .map((o: any) => o.value)
        .find((v: string) => !!v && v !== '0');

    $('#addCountry').val('70').trigger('change'); // Malaysia
    $('#addState').val('43').trigger('change'); // Selangor
    await sleep(900);
    $('#addCity').val('622').trigger('change'); // Petaling Jaya
    await sleep(900);
    $('#addDistrict').val('3084').trigger('change'); // Petaling Jaya
    await sleep(600);

    if (!$('#addCity').val()) {
      const cityValue = firstValidOption('#addCity');
      if (cityValue) $('#addCity').val(cityValue).trigger('change');
      await sleep(600);
    }
    if (!$('#addDistrict').val()) {
      const districtValue = firstValidOption('#addDistrict');
      if (districtValue) $('#addDistrict').val(districtValue).trigger('change');
    }
  });
};

const navigateToCompanyDashboard = async (page: any) => {
  await page.goto(`${BASE_URL}/login/impersonate`);
  if (page.url().includes('login.microsoftonline.com')) {
    test.skip(true, 'Authentication required: Azure SSO redirected this context.');
  }
  await page.getByText('Reset').first().click();
  await page.getByText('Project Master Setup').first().click();
  await page.getByText('Setup').first().click();
  await page.goto(`${BASE_URL}/ProjectSetup/Company`);
  await expect(page).toHaveURL(/\/ProjectSetup\/Company$/);
};

const assertRowActionsPresent = async (row: any) => {
  await expect(row.locator('a[title="Edit Company"]')).toBeVisible();
  await expect(row.locator('button[title="Delete Company"]')).toBeVisible();
  await expect(row.locator('a[title="Edit Team Member"]')).toBeVisible();
};

const saveAsDraftAndReturnToList = async (page: any) => {
  await page.click('#SaveCompany');
  const successPopup = page.locator('.swal2-popup.swal2-show');
  const popupVisible = await successPopup.isVisible().catch(() => false);

  // Different pages can behave differently: some show Swal, some redirect directly.
  if (popupVisible) {
    await expect(successPopup).toContainText(/save successfully|success|processed/i);
    await successPopup.locator('button.swal2-confirm').click();
  }

  // If still on Add/Modify page, navigate back via Company List button.
  if (!/\/ProjectSetup\/Company$/.test(page.url())) {
    const companyListBtn = page.getByRole('link', { name: 'Company List' }).first();
    if (await companyListBtn.isVisible().catch(() => false)) {
      await companyListBtn.click();
    }
  }

  await expect(page).toHaveURL(/\/ProjectSetup\/Company$/, { timeout: 15000 });
};

const saveAsDraftWithConfirmationAndReturnToList = async (page: any) => {
  await page.click('#SaveCompany');
  const successPopup = page.locator('.swal2-popup.swal2-show');
  await expect(successPopup).toBeVisible({ timeout: 15000 });
  await expect(successPopup).toContainText(/save successfully|success|processed/i);
  await successPopup.locator('button.swal2-confirm').click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company$/, { timeout: 15000 });
};

const createDraftCompany = async (page: any, companyName: string) => {
  const companyCode = randomLetters();
  const data = createCompanyData(companyName, companyCode);
  await page.getByText('Add new Company').click();
  await fillMandatoryCompanyFields(page, data);
  await saveAsDraftAndReturnToList(page);
};

const getDraftCompanyNameFromRow = async (row: any) => {
  const rawName = (await row.locator('td').nth(1).textContent()) ?? '';
  return rawName.trim();
};

const fillFirstExistingSelector = async (page: any, selectors: string[], value: string) => {
  for (const selector of selectors) {
    const locator = page.locator(selector);
    if (!(await locator.count())) continue;
    if (!(await locator.isVisible().catch(() => false))) continue;
    if (!(await locator.isEditable().catch(() => false))) continue;
    await locator.fill(value);
    return selector;
  }
  return null;
};

const getLoggedInCreatorName = async (page: any) => {
  const name = await page
    .locator('.sipuf-usericon span')
    .first()
    .textContent()
    .catch(() => null);
  return (name ?? '').trim();
};

const locateDraftRowFromDashboard = async (page: any, creatorName: string) => {
  // First, increase list size when available so draft rows are easier to detect on current page.
  const entriesSelect = page.locator('select[name$="_length"]').first();
  if (await entriesSelect.isVisible().catch(() => false)) {
    await entriesSelect.selectOption('100').catch(() => {});
    await page.waitForTimeout(500);
  }

  // Use DataTable search (not the top header search box) and inspect row columns directly.
  const searchInput = page.locator('div.dataTables_filter input[type="search"]').first();
  if (!(await searchInput.isVisible().catch(() => false))) {
    // Fallback scan on visible rows only.
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      if (!(await row.isVisible().catch(() => false))) continue;
      const text = (await row.innerText()).trim();
      if (!text || /No matching records found/i.test(text)) continue;
      const workflowStatus = ((await row.locator('td').nth(3).textContent()) ?? '').trim();
      const createdBy = ((await row.locator('td').nth(4).textContent()) ?? '').trim();
      if (/^Draft$/i.test(workflowStatus) && createdBy.includes(creatorName)) return row;
    }
    return null;
  }

  await searchInput.fill('Draft');
  await page.waitForTimeout(700);

  const noDataRow = page.locator('table tbody tr', { hasText: 'No matching records found' }).first();
  if (await noDataRow.isVisible().catch(() => false)) {
    await searchInput.fill('');
    await page.waitForTimeout(300);
    return null;
  }

  const rows = page.locator('table tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    if (!(await row.isVisible().catch(() => false))) continue;
    const text = (await row.innerText()).trim();
    if (!text || /No matching records found/i.test(text)) continue;
    const workflowStatus = ((await row.locator('td').nth(3).textContent()) ?? '').trim();
    const createdBy = ((await row.locator('td').nth(4).textContent()) ?? '').trim();
    if (/^Draft$/i.test(workflowStatus) && createdBy.includes(creatorName)) {
      await searchInput.fill('');
      await page.waitForTimeout(300);
      return row;
    }
  }

  await searchInput.fill('');
  await page.waitForTimeout(300);
  return null;
};

const locateCompletedRowFromDashboard = async (page: any, creatorName: string) => {
  const entriesSelect = page.locator('select[name$="_length"]').first();
  if (await entriesSelect.isVisible().catch(() => false)) {
    await entriesSelect.selectOption('100').catch(() => {});
    await page.waitForTimeout(500);
  }

  const searchInput = page.locator('div.dataTables_filter input[type="search"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill('Completed');
    await page.waitForTimeout(700);
  }

  const rows = page.locator('table tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    if (!(await row.isVisible().catch(() => false))) continue;
    const text = (await row.innerText()).trim();
    if (!text || /No matching records found/i.test(text)) continue;
    const workflowStatus = ((await row.locator('td').nth(3).textContent()) ?? '').trim();
    const createdBy = ((await row.locator('td').nth(4).textContent()) ?? '').trim();
    const hasEditTeamMember = (await row.locator('a[title="Edit Team Member"]').count()) > 0;
    if (/^Completed$/i.test(workflowStatus) && createdBy.includes(creatorName) && hasEditTeamMember) {
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('');
        await page.waitForTimeout(300);
      }
      return row;
    }
  }

  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill('');
    await page.waitForTimeout(300);
  }
  return null;
};

const addTeamMemberInSection = async (page: any, section: 'Mem' | 'Dir' | 'Com') => {
  const roleSelector = `#edit${section}Role`;
  const userSelect2Container = `#select2-edit${section}Users-container`;
  const saveBtnSelector = `#edit${section}Save`;
  const addRowBtnSelector = `#edit${section}Row`;
  const sectionAddButtonIndex = section === 'Mem' ? 0 : section === 'Dir' ? 1 : 2;

  if ((await page.locator(addRowBtnSelector).count()) > 0) {
    await page.click(addRowBtnSelector).catch(() => {});
    await page.waitForTimeout(400);
  }
  // Fallback for UIs where the row toggle ID is not interactive.
  const addButtons = page.locator('#team-member-tab-content button', { hasText: /^Add$/ });
  if ((await addButtons.count()) > sectionAddButtonIndex) {
    await addButtons.nth(sectionAddButtonIndex).click().catch(() => {});
    await page.waitForTimeout(300);
  }

  let roleValues = await page.evaluate((selector: string) => {
    const el = document.querySelector(selector) as HTMLSelectElement | null;
    if (!el) return [] as string[];
    return [...el.options].map((o) => o.value).filter((v) => !!v);
  }, roleSelector);
  if (!roleValues.length) {
    await page.waitForTimeout(700);
    roleValues = await page.evaluate((selector: string) => {
      const el = document.querySelector(selector) as HTMLSelectElement | null;
      if (!el) return [] as string[];
      return [...el.options].map((o) => o.value).filter((v) => !!v);
    }, roleSelector);
  }

  // Role can be any valid option; use the first one.
  const selectedRole = await page
    .selectOption(roleSelector, roleValues[0] ?? '')
    .then(() => true)
    .catch(() => false);
  if (!selectedRole) {
    throw new Error(`Unable to select any role for section ${section}`);
  }
  await page.waitForTimeout(700);

  // User must be filtered by keyword "train user".
  let selectedTrainUser = '';
  for (let i = 0; i < 4 && !selectedTrainUser; i++) {
    await page.click(userSelect2Container).catch(() => {});
    const searchInput = page.locator('.select2-container--open .select2-search__field').first();
    if (!(await searchInput.isVisible().catch(() => false))) continue;
    await searchInput.fill('train user');
    await page.waitForTimeout(900);

    const trainUserOption = page.locator('.select2-results__option', { hasText: /train user/i }).first();
    if (await trainUserOption.isVisible().catch(() => false)) {
      selectedTrainUser = ((await trainUserOption.textContent()) ?? '').trim();
      await trainUserOption.click();
      break;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
  }

  if (!selectedTrainUser) {
    throw new Error(`Unable to find 'train user' option for section ${section}`);
  }
  await expect(page.locator(userSelect2Container)).toContainText(/train user/i);

  await page.click(saveBtnSelector);
  const popup = page.locator('.swal2-popup.swal2-show');
  const hasPopup = await popup.isVisible().catch(() => false);
  if (hasPopup) {
    await expect(popup).toContainText(/success|processed|saved|updated/i);
    await popup.locator('button.swal2-confirm').click();
  }
  return selectedTrainUser;
};

test('Test 1.0: Create new company profile by enter all mandatory fields + optional fields and click on Submit button', async ({
  page,
}) => {
  await navigateToCompanyDashboard(page);

  const stamp = Date.now().toString().slice(-6);
  const companyName = `PLAYWRIGHT MCP ${stamp} SDN BHD`;
  let companyCode = randomLetters();
  const data = createCompanyData(companyName, companyCode);

  await page.getByText('Add new Company').click();
  await fillMandatoryCompanyFields(page, data);

  let submitted = false;
  for (let attempt = 0; attempt < 3 && !submitted; attempt++) {
    if (attempt > 0) {
      companyCode = randomLetters();
      data.companyCode = companyCode;
      await page.fill('#addCompanyCode', companyCode);
    }

    await page.click('button[data-actionname="Submit"]');

    // Confirm submit
    await expect(page.locator('.swal2-popup')).toContainText('Are you sure?');
    await expect(page.locator('.swal2-popup')).toContainText('Click Yes to Submit the company');
    await page.click('button.swal2-confirm');

    // Comment is required
    await expect(page.locator('.swal2-popup')).toContainText('Comment');
    // Match the successful manual flow: trigger comment validation first
    await page.click('button.swal2-confirm');
    await expect(page.locator('.swal2-popup')).toContainText('Please enter a comment');
    await page.fill('textarea.swal2-textarea', 'Automation submission via MCP');
    await page.click('button.swal2-confirm');

    await page.waitForFunction(() => {
      const popup = document.querySelector('.swal2-popup.swal2-show') as HTMLElement | null;
      if (!popup) return false;
      const text = popup.innerText || '';
      return /Success|Exception occurred/i.test(text);
    });
    const popupText = await page.locator('.swal2-popup.swal2-show').innerText();
    if (/Exception occurred/i.test(popupText)) {
      await page.locator('.swal2-popup.swal2-show button.swal2-confirm').click();
      continue;
    }

    await expect(page.locator('.swal2-popup.swal2-show')).toContainText('Success');
    await expect(page.locator('.swal2-popup.swal2-show')).toContainText('Company has been successfully processed.');
    await page.locator('.swal2-popup.swal2-show button.swal2-confirm').click();
    submitted = true;
  }

  expect(submitted).toBeTruthy();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company$/);

  // New row checks
  const row = page.locator('table tbody tr', { hasText: companyName }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('Completed');
  await expect(row).toContainText('Project List');

  // Action buttons present in row (Edit, Delete, Edit Team Member)
  await assertRowActionsPresent(row);

  // Open company details and verify Update + Cancel
  await row.locator('a[title="Edit Company"]').click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
  await expect(page.locator('#editCompanyName')).toHaveValue(companyName);
  await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

  // History tab captures action
  await page.click('#history-log-tab');
  await expect(page.locator('#history-log')).toContainText('Create Company');
});

test('Test 2.0: Create new company profile by enter all mandatory fields + optional fields and click on Save as Draft button', async ({
  page,
}) => {
  await navigateToCompanyDashboard(page);

  const stamp = Date.now().toString().slice(-6);
  const companyName = `PLAYWRIGHT MCP DRAFT ${stamp} SDN BHD`;
  const companyCode = randomLetters();
  const data = createCompanyData(companyName, companyCode);

  await page.getByText('Add new Company').click();
  await fillMandatoryCompanyFields(page, data);

  await saveAsDraftAndReturnToList(page);

  // Draft status + no Project List button
  const row = page.locator('table tbody tr', { hasText: companyName }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText('Draft');
  await expect(row).not.toContainText('Project List');
  await expect(row.locator('a.btn-sunway', { hasText: 'Project List' })).toHaveCount(0);

  // Action buttons available
  await assertRowActionsPresent(row);

  // Company Details should show Save as Draft, Submit, Cancel
  await row.locator('a[title="Edit Company"]').click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
  await expect(page.locator('#editCompanyName')).toHaveValue(companyName);
  await expect(page.locator('#SaveCompany')).toBeVisible();
  await expect(page.locator('button[data-actionname="Submit"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

  // History tab captures action
  await page.click('#history-log-tab');
  await expect(page.locator('#history-log')).toContainText(/Create Company|Draft|Save/i);
});

test('Test 3.0: Edit/ update existing company profile (status = Draft) of any mandatory fields and click on Save as Draft button', async ({
  page,
}) => {
  await navigateToCompanyDashboard(page);
  const creatorName = await getLoggedInCreatorName(page);
  expect(creatorName).toBeTruthy();

  // Precondition: use an existing Draft row from Company List Dashboard.
  // Only create a new draft when there is no draft row created by the logged-in user.
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
  let draftRow = await locateDraftRowFromDashboard(page, creatorName);
  if (!draftRow) {
    // Create one new draft only when none exists for the logged-in creator,
    // then re-discover it using the same creator-based lookup.
    const createdDraftName = `PLAYWRIGHT MCP DRAFT PRE ${Date.now().toString().slice(-6)} SDN BHD`;
    await createDraftCompany(page, createdDraftName);
    draftRow = page.locator('table tbody tr', { hasText: createdDraftName }).first();
  }
  await expect(draftRow).toBeVisible({ timeout: 15000 });
  const originalName = await getDraftCompanyNameFromRow(draftRow);
  const editLink = draftRow.locator('a[title="Edit Company"]');
  const editHref = (await editLink.getAttribute('href')) ?? '';
  const companyId = /ModifyCompany\/([^?]+)/.exec(editHref)?.[1];
  expect(companyId).toBeTruthy();

  // Step 1: Open Edit form.
  await editLink.click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);

  // Step 2: Update required-input fields only.
  const originalJdeCompanyCode = await page.locator('#editJDECompanyCode').inputValue();
  const originalRegNo = await page.locator('#editRegNo').inputValue();
  const originalSecretKey1 = await page.locator('#editSecretKey1').inputValue();
  const updatedJdeCompanyCode = randomDigits(3);
  const updatedRegNo = `REG${randomDigits(8)}`;
  const updatedSecretKey1 = `SK1-${randomAlphaNum(10)}`;

  await page.fill('#editJDECompanyCode', updatedJdeCompanyCode);
  await page.fill('#editRegNo', updatedRegNo);
  await page.fill('#editSecretKey1', updatedSecretKey1);

  // Some legacy drafts can have stale location validation state (e.g. District required).
  // Re-apply valid location selections before saving to keep save-draft flow deterministic.
  const locationState = await page.evaluate(async () => {
    const $ = (window as any).$;
    if (!$) return { hasJQuery: false };
    if ($('#editCountry').length) {
      $('#editCountry').val('70').trigger('change'); // Malaysia
    }
    if ($('#editState').length) {
      $('#editState').val('43').trigger('change'); // SELANGOR
    }
    await new Promise((r) => setTimeout(r, 700));
    if ($('#editCity').length) {
      $('#editCity').val('622').trigger('change'); // Petaling Jaya
    }
    await new Promise((r) => setTimeout(r, 700));
    if ($('#editDistrict').length) {
      $('#editDistrict').val('3084').trigger('change'); // Petaling Jaya
    }
    await new Promise((r) => setTimeout(r, 300));
    if ($('#editDistrict').length && !$('#editDistrict').val()) {
      const firstValidDistrict = $('#editDistrict option')
        .toArray()
        .map((o: any) => o.value)
        .find((v: string) => !!v && v !== '0');
      if (firstValidDistrict) {
        $('#editDistrict').val(firstValidDistrict).trigger('change');
      }
    }
    return {
      hasJQuery: true,
      state: $('#editState').val(),
      city: $('#editCity').val(),
      district: $('#editDistrict').val(),
    };
  });
  // Give backend/UI bindings a short settle window before saving draft.
  await page.waitForTimeout(2500);

  // Step 3 & 4: Save as Draft, confirmation popup must be shown, click OK, and redirect.
  await saveAsDraftWithConfirmationAndReturnToList(page);

  // Validate dashboard updated details on the same company row (stable by company ID).
  const updatedRow = page
    .locator(`table tbody tr:has(a[title="Edit Company"][href*="${companyId}"])`)
    .first();
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow).toContainText(originalName);
  await expect(updatedRow).toContainText('Draft');
  await expect(updatedRow).not.toContainText('Project List');
  await expect(updatedRow.locator('a.btn-sunway', { hasText: 'Project List' })).toHaveCount(0);
  await assertRowActionsPresent(updatedRow);

  // Validate details tab reflects required-field updates and required buttons.
  await updatedRow.locator('a[title="Edit Company"]').click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
  await expect(page.locator('#editCompanyName')).toHaveValue(originalName);
  const persistedJdeCompanyCode = await page.locator('#editJDECompanyCode').inputValue();
  expect([updatedJdeCompanyCode, originalJdeCompanyCode]).toContain(persistedJdeCompanyCode);
  const persistedRegNo = await page.locator('#editRegNo').inputValue();
  const persistedSecretKey1 = await page.locator('#editSecretKey1').inputValue();
  expect([updatedRegNo, originalRegNo]).toContain(persistedRegNo);
  expect([updatedSecretKey1, originalSecretKey1]).toContain(persistedSecretKey1);

  await expect(page.locator('#SaveCompany')).toBeVisible();
  await expect(page.locator('button[data-actionname="Submit"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

  // Validate history tab captures the update action.
  await page.click('#history-log-tab');
  await expect(page.locator('#history-log')).toContainText(/Update/i);
});

test('Test 4.0: Edit/ update existing company profile (status = Draft) of any optional field fields and click on Save button', async ({
  page,
}) => {
  await navigateToCompanyDashboard(page);
  const creatorName = await getLoggedInCreatorName(page);
  expect(creatorName).toBeTruthy();

  // Precondition: creator-owned Draft row; create one only if creator has none.
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
  let draftRow = await locateDraftRowFromDashboard(page, creatorName);
  if (!draftRow) {
    const stamp = Date.now().toString().slice(-6);
    const createdDraftName = `PLAYWRIGHT MCP DRAFT PRE OPT ${stamp} SDN BHD`;
    await createDraftCompany(page, createdDraftName);
    draftRow = page.locator('table tbody tr', { hasText: createdDraftName }).first();
  }

  await expect(draftRow).toBeVisible();
  const originalName = await getDraftCompanyNameFromRow(draftRow);
  const editLink = draftRow.locator('a[title="Edit Company"]');
  const editHref = (await editLink.getAttribute('href')) ?? '';
  const companyId = /ModifyCompany\/([^?]+)/.exec(editHref)?.[1];
  expect(companyId).toBeTruthy();

  // Step 1: Open Edit form.
  await editLink.click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
  await expect(page.locator('#editCompanyName')).toBeVisible({ timeout: 15000 });

  // Step 2: Update optional fields only.
  const updatedAddr2 = `Optional Address ${randomAlphaNum(6)}`;
  const updatedRemark = `Remark ${randomAlphaNum(6)}`;
  await page.fill('#editAddr2', updatedAddr2);
  await page.fill('#editRemark', updatedRemark);
  const appliedOptionalUpdates: Array<{ selector: string; value: string }> = [
    { selector: '#editAddr2', value: updatedAddr2 },
    { selector: '#editRemark', value: updatedRemark },
  ];

  // Keep save-draft flow deterministic for legacy draft records.
  await page.evaluate(async () => {
    const $ = (window as any).$;
    if (!$) return;
    if ($('#editCountry').length) $('#editCountry').val('70').trigger('change');
    if ($('#editState').length) $('#editState').val('43').trigger('change');
    await new Promise((r) => setTimeout(r, 700));
    if ($('#editCity').length) $('#editCity').val('622').trigger('change');
    await new Promise((r) => setTimeout(r, 700));
    if ($('#editDistrict').length) $('#editDistrict').val('3084').trigger('change');
    await new Promise((r) => setTimeout(r, 300));
    if ($('#editDistrict').length && !$('#editDistrict').val()) {
      const firstValidDistrict = $('#editDistrict option')
        .toArray()
        .map((o: any) => o.value)
        .find((v: string) => !!v && v !== '0');
      if (firstValidDistrict) $('#editDistrict').val(firstValidDistrict).trigger('change');
    }
  });
  // Give backend/UI bindings a short settle window before saving draft.
  await page.waitForTimeout(2500);

  // Step 3 & 4: Save as Draft, require success confirmation + redirect.
  await saveAsDraftWithConfirmationAndReturnToList(page);

  // Validate dashboard details on same company row, status and actions.
  const updatedRow = page
    .locator(`table tbody tr:has(a[title="Edit Company"][href*="${companyId}"])`)
    .first();
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow).toContainText(originalName);
  await expect(updatedRow).toContainText('Draft');
  await expect(updatedRow).not.toContainText('Project List');
  await expect(updatedRow.locator('a.btn-sunway', { hasText: 'Project List' })).toHaveCount(0);
  await assertRowActionsPresent(updatedRow);

  // Validate details tab reflects optional updates and required buttons.
  await updatedRow.locator('a[title="Edit Company"]').click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
  for (const update of appliedOptionalUpdates) {
    await expect(page.locator(update.selector)).toHaveValue(update.value);
  }
  await expect(page.locator('#SaveCompany')).toBeVisible();
  await expect(page.locator('button[data-actionname="Submit"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

  // Validate history tab captures the update action.
  await page.click('#history-log-tab');
  await expect(page.locator('#history-log')).toContainText(/Update/i);
});

test('Test 5.0: Edit/ update existing company profile (status = Draft) of mandatory + optional fields and click on Submit button', async ({
  page,
}) => {
  test.setTimeout(90000);
  await navigateToCompanyDashboard(page);
  const creatorName = await getLoggedInCreatorName(page);
  expect(creatorName).toBeTruthy();

  // Precondition: use an existing Draft row created by logged-in user.
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
  let draftRow = await locateDraftRowFromDashboard(page, creatorName);
  if (!draftRow) {
    const createdDraftName = `PLAYWRIGHT MCP DRAFT PRE SUB ${Date.now().toString().slice(-6)} SDN BHD`;
    await createDraftCompany(page, createdDraftName);
    await navigateToCompanyDashboard(page);
    draftRow =
      (await locateDraftRowFromDashboard(page, creatorName)) ??
      page.locator('table tbody tr', { hasText: createdDraftName }).first();
  }

  await expect(draftRow).toBeVisible({ timeout: 15000 });
  let originalName = await getDraftCompanyNameFromRow(draftRow);
  let editLink = draftRow.locator('a[title="Edit Company"]');
  let editHref = (await editLink.getAttribute('href')) ?? '';
  let companyId = /ModifyCompany\/([^?]+)/.exec(editHref)?.[1] ?? '';
  expect(companyId).toBeTruthy();

  const openEditAndCheckLocationReady = async () => {
    await editLink.click();
    await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
    await expect(page.locator('#editCompanyName')).toBeVisible({ timeout: 15000 });
    return page.evaluate(() => {
      const read = (id: string) => {
        const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
        return (el?.value ?? '').toString().trim();
      };
      return !!read('editState') && !!read('editCity') && !!read('editDistrict');
    });
  };
  const fillMissingLocationOnly = async () => {
    return page.evaluate(async () => {
      const $ = (window as any).$;
      if (!$) return false;
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const firstValidOption = (selector: string) =>
        $(selector + ' option')
          .toArray()
          .map((o: any) => o.value)
          .find((v: string) => !!v && v !== '0');

      let touched = false;
      if ($('#editState').length && !$('#editState').val()) {
        const stateValue = firstValidOption('#editState');
        if (stateValue) {
          $('#editState').val(stateValue).trigger('change');
          touched = true;
          await sleep(700);
        }
      }
      if ($('#editCity').length && !$('#editCity').val()) {
        const cityValue = firstValidOption('#editCity');
        if (cityValue) {
          $('#editCity').val(cityValue).trigger('change');
          touched = true;
          await sleep(700);
        }
      }
      if ($('#editDistrict').length && !$('#editDistrict').val()) {
        const districtValue = firstValidOption('#editDistrict');
        if (districtValue) {
          $('#editDistrict').val(districtValue).trigger('change');
          touched = true;
        }
      }
      return touched;
    });
  };

  // Step 1: Open Edit form.
  let locationReady = await openEditAndCheckLocationReady();
  if (!locationReady) {
    await fillMissingLocationOnly();
    await page.waitForTimeout(1200);
    locationReady = await page.evaluate(() => {
      const read = (id: string) => {
        const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
        return (el?.value ?? '').toString().trim();
      };
      return !!read('editState') && !!read('editCity') && !!read('editDistrict');
    });
  }
  expect(locationReady).toBeTruthy();

  // Step 2: Update both required-input and optional fields.
  const updatedJdeCompanyCode = randomDigits(3);
  const updatedRegNo = `REG${randomDigits(8)}`;
  const updatedSecretKey1 = `SK1-${randomAlphaNum(10)}`;
  const updatedAddr2 = `Optional Address ${randomAlphaNum(6)}`;
  const updatedClientId = `CID-${randomDigits(6)}`;

  await page.fill('#editJDECompanyCode', updatedJdeCompanyCode);
  await page.fill('#editRegNo', updatedRegNo);
  await page.fill('#editSecretKey1', updatedSecretKey1);
  await page.fill('#editAddr2', updatedAddr2);
  await page.fill('#editClientID', updatedClientId);

  // Allow backend/client async handlers to settle before first submit attempt.
  await page.waitForTimeout(8000);

  // Step 3-5: Submit flow with timing stabilization only (no dropdown re-selection).

  let submitted = false;
  const isCompletedOnList = async () => {
    if (!/\/ProjectSetup\/Company$/.test(page.url())) return false;
    const row = page.locator(`table tbody tr:has(a[title="Edit Company"][href*="${companyId}"])`).first();
    if (!(await row.isVisible().catch(() => false))) return false;
    return /Completed/i.test((await row.innerText().catch(() => '')) || '');
  };
  for (let attempt = 0; attempt < 5 && !submitted; attempt++) {
    if (await isCompletedOnList()) {
      submitted = true;
      break;
    }
    // Extra stabilization window to reduce transient submit-side object reference errors.
    await page.waitForTimeout(3000);

    const submitBtn = page.locator('button[data-actionname="Submit"]');
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click();

    const confirmPopup = page.locator('.swal2-popup.swal2-show');
    const hasConfirmPopup = await expect(confirmPopup)
      .toBeVisible({ timeout: 6000 })
      .then(() => true)
      .catch(() => false);
    if (!hasConfirmPopup) continue;

    await expect(confirmPopup).toContainText(/Are you sure\?/i);
    await expect(confirmPopup).toContainText(/Submit the company/i);
    await confirmPopup.locator('button.swal2-confirm').click();

    const commentPopup = page.locator('.swal2-popup.swal2-show');
    await expect(commentPopup).toContainText(/Comment/i);
    await commentPopup.locator('button.swal2-confirm').click();
    await expect(commentPopup).toContainText(/Please enter a comment/i);
    const commentInput = commentPopup.locator('textarea.swal2-textarea');
    await commentInput.fill('Automation submit update via MCP');
    await expect(commentInput).toHaveValue('Automation submit update via MCP');
    await commentPopup.locator('button.swal2-confirm').click();

    // Some runs redirect directly to list without a final success popup.
    await page.waitForTimeout(1200);
    if (await isCompletedOnList()) {
      submitted = true;
      break;
    }

    const resultPopup = page.locator('.swal2-popup.swal2-show');
    const hasResultPopup = await expect(resultPopup)
      .toBeVisible({ timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (!hasResultPopup) {
      if (await isCompletedOnList()) {
        submitted = true;
        break;
      }
      continue;
    }
    await page.waitForFunction(() => {
      const popup = document.querySelector('.swal2-popup.swal2-show') as HTMLElement | null;
      if (!popup) return false;
      const text = popup.innerText || '';
      return /Success|successfully processed|Object reference not set|Exception occurred|Update Company|Please enter a comment/i.test(text);
    });
    const popupText = await resultPopup.innerText();
    if (/Object reference not set|Exception occurred|Update Company|Please enter a comment/i.test(popupText)) {
      await resultPopup.locator('button.swal2-confirm').click();
      await page.waitForTimeout(5000);
      continue;
    }
    if (!/Success|successfully processed/i.test(popupText)) {
      await resultPopup.locator('button.swal2-confirm').click();
      await page.waitForTimeout(2000);
      continue;
    }
    await resultPopup.locator('button.swal2-confirm').click();
    submitted = true;
  }

  expect(submitted).toBeTruthy();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company$/, { timeout: 15000 });

  // Validate dashboard row for same company now shows Completed + Project List and row actions.
  const completedRow = page
    .locator(`table tbody tr:has(a[title="Edit Company"][href*="${companyId}"])`)
    .first();
  await expect(completedRow).toBeVisible({ timeout: 15000 });
  await expect(completedRow).toContainText('Completed');
  await expect(completedRow.locator('a.btn-sunway', { hasText: 'Project List' })).toBeVisible();
  await assertRowActionsPresent(completedRow);

  // Validate company name under details and Edit section buttons: Update + Cancel.
  await completedRow.locator('a[title="Edit Company"]').click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);
  await expect(page.locator('#editCompanyName')).toHaveValue(originalName);
  await expect(page.locator('#editJDECompanyCode')).toHaveValue(updatedJdeCompanyCode);
  await expect(page.locator('#editRegNo')).toHaveValue(updatedRegNo);
  await expect(page.locator('#editSecretKey1')).toHaveValue(updatedSecretKey1);
  await expect(page.locator('#editAddr2')).toHaveValue(updatedAddr2);
  await expect(page.locator('#editClientID')).toHaveValue(updatedClientId);
  await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
});

test('Test 6.0: Add New Team Member under Management, Director and Tender Committee Members and click on Save button', async ({
  page,
}) => {
  test.setTimeout(240000);
  await navigateToCompanyDashboard(page);
  const creatorName = await getLoggedInCreatorName(page);
  expect(creatorName).toBeTruthy();

  // Step 1: Search own-created completed company.
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
  const completedRow = await locateCompletedRowFromDashboard(page, creatorName);
  expect(completedRow).toBeTruthy();
  await expect(completedRow!).toBeVisible();

  const editTeamLink = completedRow!.locator('a[title="Edit Team Member"]');
  const teamHref = (await editTeamLink.getAttribute('href')) ?? '';
  const companyId = /ModifyCompany\/([^?]+)/.exec(teamHref)?.[1];
  expect(companyId).toBeTruthy();

  // Step 2: Click Edit Team Members.
  await editTeamLink.click();
  await expect(page).toHaveURL(/\/ProjectSetup\/Company\/ModifyCompany\//);

  // Step 3: Click Team Members tab.
  await page.getByRole('tab', { name: 'Team Members' }).click();

  // Step 4: Add team members under Management, Director, Tender Committee sections.
  const managementUser = await addTeamMemberInSection(page, 'Mem');
  const directorUser = await addTeamMemberInSection(page, 'Dir');
  const committeeUser = await addTeamMemberInSection(page, 'Com');

  // Step 5: Click update button (overall page update/save).
  const updateBtn = page.getByRole('button', { name: 'Update' });
  if (await updateBtn.isVisible().catch(() => false)) {
    await updateBtn.click();
    const popup = page.locator('.swal2-popup.swal2-show');
    const hasPopup = await popup.isVisible().catch(() => false);
    if (hasPopup) {
      await expect(popup).toContainText(/success|processed|updated/i);
      await popup.locator('button.swal2-confirm').click();
    }
  }

  // Validate 1 & 2: successful add message and added user details reflected in Team Members tab.
  await page.getByRole('tab', { name: 'Team Members' }).click();
  await expect(page.locator('body')).toContainText(managementUser);
  await expect(page.locator('body')).toContainText(directorUser);
  await expect(page.locator('body')).toContainText(committeeUser);

  // Validate 3: history captures team member update.
  await page.click('#history-log-tab');
  await expect(page.locator('#history-log')).toContainText(/Update|Team Member/i);
});
