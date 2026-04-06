import { test, expect } from '@playwright/test';

test.describe('Complete Scorecard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can complete entire scorecard process', async ({ page }) => {
    // Step 1: Category selection
    await page.getByLabel('💼 Career').click();
    await page.getByLabel('Decision Title').fill('Career change to tech');
    await page.getByLabel('Pre-decision (planning)').click();
    await page.getByRole('button', { name: 'Next: Score Your Decision' }).click();

    // Step 2: Score pillars
    // Planning - Good
    await page.locator('input[value="1"]').first().click();
    await page.locator('textarea').first().fill('Saved 6 months of expenses');

    // Research - Bad
    await page.locator('input[value="0"]').nth(1).click();

    // Timing - Good
    await page.locator('input[value="1"]').nth(2).click();

    // Emotional - Good
    await page.locator('input[value="1"]').last().click();

    await page.getByRole('button', { name: 'Next: Review' }).click();

    // Step 3: Review
    await expect(page.getByText('Total Score: 3')).toBeVisible();
    await expect(page.getByText('Verdict: Excellent')).toBeVisible();

    await page.getByRole('button', { name: 'Save Scorecard' }).click();

    // Step 4: Results
    await expect(page.getByText('Scorecard saved successfully!')).toBeVisible();
    await expect(page.getByText('AI-Generated Insights')).toBeVisible();
  });

  test('shows warning for low scores', async ({ page }) => {
    // Complete flow with poor scores
    await page.getByLabel('💰 Savings').click();
    await page.getByLabel('Decision Title').fill('Emergency fund decision');
    await page.getByRole('button', { name: 'Next: Score Your Decision' }).click();

    // All Ugly scores
    for (let i = 0; i < 4; i++) {
      await page.locator('input[value="-1"]').nth(i).click();
    }

    await page.getByRole('button', { name: 'Next: Review' }).click();

    await expect(page.getByText('Total Score: -4')).toBeVisible();
    await expect(page.getByText('Verdict: Critical')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveClass(/error/);
  });
});