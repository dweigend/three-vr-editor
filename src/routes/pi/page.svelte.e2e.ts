/**
 * Purpose: Smoke-test the remaining Pi surfaces without requiring a real API key.
 * Context: This verifies that the consolidated settings page and chat page are reachable in the preview app.
 * Responsibility: Assert the basic route shells and the main interactive controls.
 * Boundaries: It does not exercise live Pi calls or credential persistence.
 */

import { expect, test } from '@playwright/test';

test('renders the consolidated settings page', async ({ page }) => {
	await page.goto('/pi');

	await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
	await expect(page.getByLabel('OpenRouter API key')).toBeVisible();
	await expect(page.getByLabel('Active model')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Validate and store key' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save model' })).toBeVisible();
});

test('renders the pi chat page', async ({ page }) => {
	await page.goto('/pi/chat');

	await expect(page.getByRole('heading', { level: 1, name: 'Chat' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Start session' })).toBeVisible();
});
