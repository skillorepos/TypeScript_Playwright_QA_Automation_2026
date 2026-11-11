import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const loginPageUrl = pathToFileURL(
	resolve(__dirname, '../pages/login-page.html'),
).href;

test.beforeEach(async ({ page }) => {
	await page.goto(loginPageUrl, { waitUntil: 'domcontentloaded' });
});

test('signs in with valid credentials', async ({ page }) => {
	// Alternative: page.getByLabel('Email address')
	await page.locator('#email').fill('alex@example.com');
	// Alternative: page.getByLabel('Password', { exact: true })
	await page.locator('input[name="password"]').fill('Playwright123!');
	// Alternative: page.getByRole('button', { name: 'Sign in', exact: true })
	await page.locator('#login-form .primary-button').click();

	await expect(page).toHaveURL(/\/home-page\.html$/);
	await expect(page.locator('#user-name')).toHaveText('Alex');
	await expect(page.getByRole('heading', { name: 'Make room for good things.' })).toBeVisible();
});

test('shows validation errors when required fields are empty', async ({ page }) => {
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();

	await expect(page.getByText('Enter your email address.', { exact: true })).toBeVisible();
	await expect(page.getByText('Enter your password.', { exact: true })).toBeVisible();
	await expect(page.getByLabel('Email address')).toBeFocused();
	await expect(page).toHaveURL(loginPageUrl);
});

test('rejects an incorrect password', async ({ page }) => {
	// Alternative: page.getByLabel('Email address')
	await page.locator('xpath=//input[@id="email"]').fill('alex@example.com');
	// Alternative: page.getByLabel('Password', { exact: true })
	await page.locator('xpath=//input[@name="password"]').fill('WrongPassword!');
	// Alternative: page.getByRole('button', { name: 'Sign in', exact: true })
	await page.locator('xpath=//button[normalize-space(.)="Sign in"]').click();

	await expect(page.getByRole('alert')).toHaveText(
		'Email or password is incorrect. Please try again.',
	);
	await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
	await expect(page).toHaveURL(loginPageUrl);
});

test('shows and hides the password', async ({ page }) => {
	const passwordInput = page.getByLabel('Password', { exact: true });
	await passwordInput.fill('Playwright123!');
	await expect(passwordInput).toHaveAttribute('type', 'password');

	await page.getByRole('button', { name: 'Show password', exact: true }).click();
	await expect(passwordInput).toHaveAttribute('type', 'text');
	await expect(passwordInput).toHaveValue('Playwright123!');

	await page.getByRole('button', { name: 'Hide password', exact: true }).click();
	await expect(passwordInput).toHaveAttribute('type', 'password');
});

test('remembers the email after signing out', async ({ page }) => {
	await page.getByLabel('Email address').fill('alex@example.com');
	await page.getByLabel('Password', { exact: true }).fill('Playwright123!');
	await page.getByLabel('Remember my email').check();
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();
	await expect(page).toHaveURL(/\/home-page\.html$/);

	await page.getByRole('button', { name: 'Sign out', exact: true }).click();

	await expect(page).toHaveURL(loginPageUrl);
	await expect(page.getByLabel('Email address')).toHaveValue('alex@example.com');
	await expect(page.getByLabel('Remember my email')).toBeChecked();
	await expect(page.getByLabel('Password', { exact: true })).toBeEmpty();
});
