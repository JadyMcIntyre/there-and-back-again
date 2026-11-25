import { expect, test } from '@playwright/test'

test('explores the map, scene and journal without missing runtime files', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${new URL(response.url()).pathname}`)
  })
  page.on('requestfailed', request => {
    if (request.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`Failed request ${new URL(request.url()).pathname}`)
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'The Wilderland Atlas' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Select Rivendell' })).toBeVisible()
  await expect(page.getByText('7 chapters read')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('atlas-desktop.png'), animations: 'disabled' })

  const bagEndPin = page.getByRole('button', { name: 'Select Bag End' })
  const x = (await bagEndPin.boundingBox())!.x
  await page.getByRole('button', { name: 'Rotate view' }).click()
  await expect.poll(async () => Math.abs((await bagEndPin.boundingBox())!.x - x)).toBeGreaterThan(8)
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.getByRole('button', { name: 'Reset camera' }).click()
  await page.getByRole('button', { name: 'List discovered places' }).click()
  await page.getByRole('button', { name: /Rivendell/ }).last().click()
  await expect(page.getByRole('heading', { name: 'Rivendell' })).toBeVisible()
  await page.getByRole('button', { name: 'Find on map' }).click()

  await page.getByRole('link', { name: 'Atlas', exact: true }).click()
  await page.getByRole('link', { name: 'Visit Bag End' }).click()
  await expect(page.getByRole('button', { name: 'Inspect Bilbo Baggins' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Inspect Gandalf' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Inspect The Round Door' })).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('bag-end-desktop.png'), animations: 'disabled' })
  await page.getByRole('button', { name: 'Inspect Bilbo Baggins' }).click()
  await expect(page.getByRole('heading', { name: 'Bilbo Baggins' })).toBeVisible()
  await page.getByRole('button', { name: 'Inspect The Round Door' }).click()
  await page.getByRole('button', { name: 'Open the door' }).click()
  await expect(page.getByRole('button', { name: 'Close the door' })).toBeVisible()

  await page.getByRole('link', { name: 'Journal', exact: true }).click()
  await page.getByRole('button', { name: 'Recaps', exact: true }).click()
  await expect(page.getByText('An Unexpected Party', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('region', { name: 'Reading journal' }).getByText('Flies and Spiders')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('keeps historical exploration and direct links below the bookmark', async ({ page }) => {
  await page.goto('/#/atlas')
  await page.getByRole('button', { name: /III A Short Rest/ }).click()
  await expect(page.getByText('Exploring Chapter III')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Select Beorn’s House' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Search atlas' }).click()
  await page.getByRole('searchbox', { name: 'Search discovered places and journal entries' }).fill('Beorn')
  await expect(page.getByText('No discoveries match your search.')).toBeVisible()
  await page.getByRole('searchbox', { name: 'Search discovered places and journal entries' }).fill('Rivendell')
  await expect(page.getByRole('dialog').getByRole('button', { name: /Rivendell The hidden valley/ })).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Return to bookmark' }).click()
  await expect(page.getByRole('button', { name: 'Select Beorn’s House' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit reading bookmark' }).click()
  await page.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('1')
  await page.getByRole('button', { name: 'Save bookmark' }).click()
  await expect(page.getByText('PDF page 25')).toBeVisible()
  await page.goto('/#/scene/bag-end')
  await page.reload()
  await expect(page.getByText('PDF page 25')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The Wilderland Atlas' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Visit Bag End' })).toHaveCount(0)
  await page.goto('/#/journal/beorn-character')
  await expect(page.getByRole('heading', { name: 'The Reader’s Journal' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Beorn/ })).toHaveCount(0)
})

test('fits a mobile viewport and loads the production slice offline', async ({ page, context }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Select Bag End' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Search atlas' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: testInfo.outputPath('atlas-mobile.png'), fullPage: true, animations: 'disabled' })
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (navigator.serviceWorker.controller) return
    await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }))
  })
  await context.setOffline(true)
  await page.goto('/#/scene/bag-end')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bag End', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Inspect Bilbo Baggins' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('bag-end-mobile.png'), fullPage: true, animations: 'disabled' })
})
