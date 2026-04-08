/**
 * Purpose: Smoke-test the remaining Pi surfaces without requiring a real API key.
 * Context: This verifies that the consolidated settings page and chat page are reachable in the preview app.
 * Responsibility: Assert the basic route shells and the main interactive controls.
 * Boundaries: It does not exercise live Pi calls or credential persistence.
 */

import { expect, test } from '@playwright/test';

test('renders the consolidated settings page', async ({ page }) => {
	await page.goto('/pi');

	await expect(page.getByLabel('OpenRouter API key')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Store key' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save model' })).toBeVisible();
	await expect(page.getByText('Models')).toBeVisible();
});

test('renders the pi chat page', async ({ page }) => {
	await page.goto('/pi/chat');

	await expect(page.getByRole('button', { name: 'Start session' })).toBeVisible();
});

test('renders the editor Pi pane with one-shot and session controls', async ({ page }) => {
	await page.goto('/three/editor/pi');

	await expect(page.getByText('Pi agent')).toBeVisible();
	await expect(page.getByRole('button', { name: 'One-shot' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Session' })).toBeVisible();
	await expect(page.getByText('Preview')).toBeVisible();
});
