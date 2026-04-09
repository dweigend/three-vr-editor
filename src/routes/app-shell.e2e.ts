/**
 * Purpose: Smoke-test the three primary application pages without requiring a real API key.
 * Context: This verifies that the flattened route structure stays reachable after the route cleanup.
 * Responsibility: Assert the basic page shells and the main interactive controls.
 * Boundaries: It does not exercise live Pi calls or credential persistence.
 */

import { expect, test } from '@playwright/test';

test('renders the settings page', async ({ page }) => {
	await page.goto('/settings');

	await expect(page.getByLabel('OpenRouter API key')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Store key' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save model' })).toBeVisible();
	await expect(page.getByText('Models')).toBeVisible();
});

test('renders the chat page', async ({ page }) => {
	await page.goto('/chat');

	await expect(page.getByRole('button', { name: 'Start session' })).toBeVisible();
});

test('renders the editor page with Pi controls and preview', async ({ page }) => {
	await page.goto('/editor');

	await expect(page.getByText('Pi agent')).toBeVisible();
	await expect(page.getByRole('button', { name: 'One-shot' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Session' })).toBeVisible();
	await expect(page.getByText('Preview')).toBeVisible();
});
