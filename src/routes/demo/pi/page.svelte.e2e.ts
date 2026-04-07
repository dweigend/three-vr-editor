/**
 * Purpose: Smoke-test the Pi demo routes without requiring a real API key.
 * Context: This verifies that the key, chat, and model pages are reachable in the preview app.
 * Responsibility: Assert the basic route shells and the main interactive controls.
 * Boundaries: It does not exercise live Pi calls or credential persistence.
 */

import { expect, test } from '@playwright/test';

test('renders the pi key setup page', async ({ page }) => {
	await page.goto('/demo/pi');

	await expect(page.getByRole('heading', { level: 1, name: 'Pi key setup' })).toBeVisible();
	await expect(page.getByLabel('OpenRouter API key')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Validate and store key' })).toBeVisible();
});

test('renders the pi chat page', async ({ page }) => {
	await page.goto('/demo/pi/chat');

	await expect(page.getByRole('heading', { level: 1, name: 'Pi chat demo' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible();
});

test('renders the pi model settings page', async ({ page }) => {
	await page.goto('/demo/pi/models');

	await expect(page.getByRole('heading', { level: 1, name: 'Pi model settings' })).toBeVisible();
	await expect(page.getByLabel('Active model')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save model' })).toBeVisible();
});
