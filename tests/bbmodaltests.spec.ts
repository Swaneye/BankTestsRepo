import { test, expect } from '@playwright/test';

test.describe('Loan Modal Calculator Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://laenutaotlus.bigbank.ee');

    await expect(page).toHaveTitle(/Bigbank/);
    await expect(page.locator('text=Vali sobiv summa ja periood')).toBeVisible();

    await page.locator('label:has-text("Laenusumma")').textContent();
    await page.locator('label:has-text("Periood")').textContent();
    await page.locator('p.bb-labeled-value__label:has-text("Kuumakse")').textContent();

    await expect(page.locator('button[type="button"]:has-text("JÄTKA")')).toBeVisible();
  });

test('Modal loads with expected URL values', async ({ page }) => {
    await page.goto('https://laenutaotlus.bigbank.ee/?amount=5000&period=60&productName=SMALL_LOAN&loanPurpose=DAILY_SETTLEMENTS');

    await expect(page.locator('input[name="header-calculator-amount"]')).toHaveValue('5,000');
    await expect(page.locator('input[name="header-calculator-period"]')).toHaveValue('60');

    await expect(page.locator('text=€124.21')).toBeVisible();
    await expect(page.locator('button[type="button"]:has-text("JÄTKA")')).toBeVisible();
    });

test('Your amount choice is saved after clicking JÄTKA', async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    await amountInput.fill('17000');
    await page.click('button[type="button"]:has-text("JÄTKA")');
    await expect(page.locator('.bb-edit-amount__amount')).toHaveText('17000 €');
    });

test('Your period choice is saved after clicking JÄTKA', async ({ page }) => {
    const periodInput = page.locator('input[name="header-calculator-period"]');
    await periodInput.fill('86');
    await page.click('button[type="button"]:has-text("JÄTKA")');
    await page.click('button:has(.bb-edit-amount__amount)');
    await expect(page.locator('input[name="header-calculator-period"]')).toHaveValue('86');
    });

test('Opening modal with edited URL values do not allow to break amount and period max limits', async ({ page }) => {
    await page.goto('https://laenutaotlus.bigbank.ee/?amount=40000&period=240&productName=SMALL_LOAN&loanPurpose=DAILY_SETTLEMENTS');

    await expect(page).toHaveTitle(/Taotlus | Bigbank/);
    await expect(page.locator('text=Vali sobiv summa ja periood')).toBeVisible();

    await page.locator('label:has-text("Laenusumma")').textContent();
    await page.locator('label:has-text("Periood")').textContent();

    await expect(page.locator('input[name="header-calculator-amount"]')).toHaveValue('30,000');
    await expect(page.locator('input[name="header-calculator-period"]')).toHaveValue('120');

    await expect(page.locator('text=€495.65')).toBeVisible();
    });

test('Opening modal with edited URL values do not allow to break amount and period min limits', async ({ page }) => {
    await page.goto('https://laenutaotlus.bigbank.ee/?amount=100&period=1&productName=SMALL_LOAN&loanPurpose=DAILY_SETTLEMENTS');

    await expect(page).toHaveTitle(/Taotlus | Bigbank/);
    await expect(page.locator('text=Vali sobiv summa ja periood')).toBeVisible();

    await page.locator('label:has-text("Laenusumma")').textContent();
    await page.locator('label:has-text("Periood")').textContent();

    await expect(page.locator('input[name="header-calculator-amount"]')).toHaveValue('500');
    await expect(page.locator('input[name="header-calculator-period"]')).toHaveValue('6');

    await expect(page.locator('text=€91.39')).toBeVisible();
    });

test('Your exceeding max limits amount and period inputs are autocorrected to min possible values', async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    const periodInput = page.locator('input[name="header-calculator-period"]');
    await amountInput.fill('50000');
    await periodInput.fill('360');
    await page.click('button[type="button"]:has-text("JÄTKA")');
    await expect(page.locator('.bb-edit-amount__amount')).toHaveText('30000 €');
    await page.click('button:has(.bb-edit-amount__amount)');
    await expect(page.locator('input[name="header-calculator-period"]')).toHaveValue('120');
    });

test('Your exceeding min limits amount and period inputs are autocorrected to min possible values', async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    const periodInput = page.locator('input[name="header-calculator-period"]');
    await amountInput.fill('300');
    await periodInput.fill('1');
    await page.click('button[type="button"]:has-text("JÄTKA")');
    await expect(page.locator('.bb-edit-amount__amount')).toHaveText('500 €');
    await page.click('button:has(.bb-edit-amount__amount)');
    await expect(page.locator('input[name="header-calculator-period"]')).toHaveValue('6');
    });

test('Clicking away from the modal closes it and does not save values' , async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    await amountInput.fill('17000');
    await page.mouse.click(10, 10);
    await expect(page.locator('.bb-edit-amount__amount')).toHaveText('5000 €'); // stays to default 5000€
    });

test('Monthly payment APRC check 1', async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    const periodInput = page.locator('input[name="header-calculator-period"]');
    await amountInput.fill('10000');
    await periodInput.fill('60');
    await expect(page.locator('text=€244.44')).toBeVisible(); // APRC is 10.5%
    });

test('Monthly payment APRC check 2', async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    const periodInput = page.locator('input[name="header-calculator-period"]');
    await amountInput.fill('30000');
    await periodInput.fill('60');
    await expect(page.locator('text=€725.32')).toBeVisible(); // APRC is 9.5%
    });

test('Amounts with commas', async ({ page }) => {
    const amountInput = page.locator('input[name="header-calculator-amount"]');
    const periodInput = page.locator('input[name="header-calculator-period"]');
    await amountInput.fill('10000.99');
    await periodInput.fill('60');
    await expect(page.locator('text=€244.46')).toBeVisible(); // Must be more than for 10000€ which is 244.44€
    });
});
