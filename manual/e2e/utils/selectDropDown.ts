import { Page, Locator, expect } from "@playwright/test";
import { Vendor } from "./vms/general-setup";

export async function selectRandomDropdown(page: Page, dropdownTrigger: Locator, optionsToExclude: string[] = []){
  // open the dropdown
  await dropdownTrigger.click()
  // ensure only select enabled options
  const options = page.locator('.select2-results__option:not([aria-disabled="true"])');
  await options.first().waitFor({state: 'visible'});

  // filter invalid options
  const validIndexes: number[] = [];
  const count = await options.count();

  for (let i = 0; i < count; i++){
    const text = (await options.nth(i).innerText()).trim();
    if (optionsToExclude.includes(text)) continue;
    if (!text) continue;
    validIndexes.push(i);
  }

  if (validIndexes.length === 0) {
    throw new Error('No valid dropdown options available');
  }

  const randomIndex = validIndexes[Math.floor(Math.random() * validIndexes.length)];
  // nth - use to select specific element from list of matching elements based on zero-based index
  const selectedValue = (await options.nth(randomIndex).innerText()).trim();
  // select that item
  await options.nth(randomIndex).click();

  return selectedValue;
}

export async function isDuplicateCompanyCode(page: Page){
  const error = page.getByText("Company code already exists. Please enter another company code",
    {exact: false}
  );
  // check whether the error is visible on the screen
  return await error.isVisible();
}

export async function selectRandomVendor(page: Page, vendors: Vendor[]): Promise<Vendor>{
  // ensure provided email list is not empty
  if (vendors.length === 0){
    throw new Error('No registered vendors available');
  }

  // select random email from the list
  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)]
  const { companyName, email } = randomVendor;

  const dropdown = page.locator('#showHideSelectBox1');
  await dropdown.click();
  await dropdown.getByRole('searchbox').fill(companyName);
  // wait for the dropdown options to load
  await page.waitForTimeout(3000);

  const option = page.locator('.select2-results__option:not([aria-disabled="true"])', { hasText: companyName });
  await option.first().waitFor({state: 'visible'});  // make sure it appears
  // click matched option
  await option.first().click();

  return randomVendor;
}