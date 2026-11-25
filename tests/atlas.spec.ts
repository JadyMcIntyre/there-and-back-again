import { expect, test, type Page } from '@playwright/test'

const stage = (page: Page) => page.locator('.world-stage')
const marker = (page: Page, name: string) => page.getByRole('button', { name: `Select ${name}`, exact: true })
const search = (page: Page) => page.getByRole('searchbox', { name: 'Search discovered places and journal entries' })

async function activeWorld(page: Page, world: 'atlas' | 'bag-end') {
  await expect(stage(page)).toHaveAttribute('data-active-world', world)
  await expect(stage(page)).toHaveAttribute('data-transition', 'idle')
}

test('explores the atlas, Bag End, journal and recaps without missing runtime files', async ({ page }, testInfo) => {
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
  await expect(marker(page, 'Rivendell')).toBeVisible()
  await expect(page.getByText('7 chapters read')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('atlas-desktop.png'), animations: 'disabled' })

  await page.getByRole('button', { name: 'Collapse field notes' }).click()
  await expect(page.getByRole('button', { name: 'Open field notes' })).toBeVisible()
  await page.getByRole('button', { name: 'Enter immersive mode' }).click()
  await expect(page.getByRole('region', { name: 'Chapter trail' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Exit immersive mode' }).click()
  await page.getByRole('button', { name: 'Open field notes' }).click()

  const bagEndPin = marker(page, 'Bag End')
  const x = (await bagEndPin.boundingBox())!.x
  await page.getByRole('button', { name: 'Rotate view' }).click()
  await expect.poll(async () => Math.abs((await bagEndPin.boundingBox())!.x - x)).toBeGreaterThan(8)
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.getByRole('button', { name: 'Reset camera' }).click()

  await page.getByRole('button', { name: 'List discovered places' }).click()
  const list = page.getByRole('complementary', { name: 'Discovered locations' })
  await list.getByRole('button', { name: /Rivendell/ }).click()
  await expect(page.getByRole('heading', { name: 'Rivendell' })).toBeVisible()
  await page.getByRole('button', { name: 'Find on map' }).click()
  await page.getByRole('button', { name: 'Reset camera' }).click()
  await page.getByRole('button', { name: 'List discovered places' }).click()
  await list.getByRole('button', { name: /Bag End/ }).click()
  await page.getByRole('link', { name: 'Visit Bag End' }).click()
  await activeWorld(page, 'bag-end')
  await expect(page.getByRole('button', { name: 'Inspect The Round Door' })).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('bag-end-desktop.png'), animations: 'disabled' })

  await page.getByRole('button', { name: 'Inspect Bilbo Baggins' }).click()
  await expect(page.getByRole('heading', { name: 'Bilbo Baggins' })).toBeVisible()
  await page.getByRole('button', { name: 'Inspect The Round Door' }).click()
  await page.getByRole('button', { name: 'Open the door' }).click()
  await expect(page.getByRole('button', { name: 'Close the door' })).toBeVisible()

  await page.getByRole('link', { name: 'Journal', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Bilbo Baggins' })).toBeVisible()
  await expect(page.getByText('First appearance · Chapter I')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('journal-desktop.png'), animations: 'disabled' })

  await page.getByRole('button', { name: 'Recaps', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'An Unexpected Party', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Key events' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Reading journal' }).getByText('Flies and Spiders')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('recap-desktop.png'), animations: 'disabled' })
  expect(errors).toEqual([])
})

test('historical exploration focuses a visible place and keeps chapter and bookmark state separate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/atlas')
  const rivendell = marker(page, 'Rivendell')
  await expect(rivendell).toBeVisible()
  const atlasX = (await rivendell.boundingBox())!.x
  await page.getByRole('button', { name: 'III A Short Rest', exact: true }).click()
  await expect(page).toHaveURL(/#\/atlas\/rivendell\?chapter=3$/)
  await expect(page.getByText(/Exploring Chapter III/)).toBeVisible()
  await expect(rivendell).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => Math.abs((await rivendell.boundingBox())!.x - atlasX)).toBeGreaterThan(45)
  await expect(marker(page, 'Beorn’s House')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'A Short Rest' })).toBeVisible()
  await expect(page.getByText('PDF page 113')).toBeVisible()

  await page.getByRole('button', { name: 'Search atlas' }).click()
  await search(page).press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Search atlas' }).click()
  await search(page).fill('Beorn')
  await expect(page.getByText('No discoveries match your search.')).toBeVisible()
  await search(page).fill('Bilbo')
  await expect(page.getByRole('dialog').locator('.search-results button').first()).toHaveText(/Bilbo Baggins/)
  await search(page).press('ArrowDown')
  await expect(page.getByRole('dialog').locator('.search-results button').first()).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/journal\/bilbo\?chapter=3$/)
  await expect(page.getByText(/Riddles in the Dark/)).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Gollum/ })).toHaveCount(0)

  await page.goBack()
  await expect(page.getByRole('button', { name: 'Return to bookmark' })).toBeVisible()
  await page.getByRole('button', { name: 'Return to bookmark' }).click()
  await expect(page).toHaveURL(/#\/atlas\/forest-gate$/)
  await expect(marker(page, 'Beorn’s House')).toBeAttached()
  await expect(page.getByText('PDF page 113')).toBeVisible()

  await page.getByRole('button', { name: 'Edit reading bookmark' }).click()
  await page.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('1')
  await page.getByRole('button', { name: 'Save bookmark' }).click()
  await expect(page.getByText('PDF page 25')).toBeVisible()
  await page.goto('/#/scene/bag-end')
  await page.reload()
  await activeWorld(page, 'atlas')
  await expect(page.getByText('PDF page 25')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Visit Bag End' })).toHaveCount(0)
  await page.goto('/#/journal/beorn-character?chapter=7')
  await expect(page.getByRole('heading', { name: 'The Reader’s Journal' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Beorn/ })).toHaveCount(0)
})

test.describe('world transitions', () => {
  test.use({ serviceWorkers: 'block' })

  test('holds the outgoing world during loading, cancels rapid navigation, and restores the map pose', async ({ page }) => {
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    await page.route('**/BagEnd-*.js', async route => {
      await gate
      await route.continue()
    })
    await page.goto('/')
    await expect(marker(page, 'Bag End')).toBeVisible()
    const pin = marker(page, 'Bag End')
    const original = (await pin.boundingBox())!
    await page.getByRole('button', { name: 'Rotate view' }).click()
    await expect.poll(async () => Math.abs((await pin.boundingBox())!.x - original.x)).toBeGreaterThan(10)
    await page.waitForTimeout(550)
    const before = (await pin.boundingBox())!

    await page.getByRole('link', { name: 'Visit Bag End' }).click()
    await expect(stage(page)).toHaveAttribute('data-transition', 'approach')
    await expect(page.locator('[data-world="atlas"]')).toHaveCSS('opacity', '1')
    await expect(page.locator('[data-world="bag-end"]')).toHaveCSS('opacity', '0')
    await page.getByRole('link', { name: 'Back to the atlas' }).click()
    await activeWorld(page, 'atlas')
    await expect.poll(async () => Math.abs((await pin.boundingBox())!.x - before.x)).toBeLessThan(2)

    await page.getByRole('link', { name: 'Visit Bag End' }).click()
    release()
    await activeWorld(page, 'bag-end')
    await expect(page.locator('.world-layer')).toHaveCount(1)
    await page.getByRole('link', { name: 'Back to the atlas' }).click()
    await expect(stage(page)).toHaveAttribute('data-transition', 'return')
    await activeWorld(page, 'atlas')
    await expect(page).toHaveURL(/#\/atlas\/bag-end$/)
    const returned = (await pin.boundingBox())!
    expect(Math.abs(returned.x - before.x)).toBeLessThan(3)
    expect(Math.abs(returned.y - before.y)).toBeLessThan(3)
    await expect(pin).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('phone', () => {
  test.use({ hasTouch: true, isMobile: true })

  test('mobile sheets work and both worlds reload offline', async ({ page, context }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(marker(page, 'Bag End')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({ path: testInfo.outputPath('atlas-mobile.png'), fullPage: true, animations: 'disabled' })
    await page.getByRole('button', { name: 'Open field notes' }).tap()
    await page.getByRole('link', { name: 'Visit Bag End' }).tap()
    await activeWorld(page, 'bag-end')
    await page.getByRole('button', { name: 'Inspect The Round Door' }).tap()
    await expect(page.getByRole('button', { name: 'Open the door' })).toBeVisible()
    const doorPin = page.getByRole('button', { name: 'Inspect The Round Door' })
    await expect.poll(async () => {
      const pin = (await doorPin.boundingBox())!
      const sheet = (await page.locator('.field-overlay').boundingBox())!
      return pin.y + pin.height < sheet.y
    }).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('bag-end-mobile-sheet.png'), fullPage: true, animations: 'disabled' })
    await page.getByRole('button', { name: 'Collapse field notes' }).tap()
    await page.screenshot({ path: testInfo.outputPath('bag-end-mobile.png'), fullPage: true, animations: 'disabled' })
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (navigator.serviceWorker.controller) return
      await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }))
    })
    await context.setOffline(true)
    await page.reload()
    await activeWorld(page, 'bag-end')
    await expect(page.getByRole('button', { name: 'Inspect Bilbo Baggins' })).toBeVisible()
    await page.getByRole('link', { name: 'Back to the atlas' }).tap()
    await activeWorld(page, 'atlas')
    await expect(marker(page, 'Bag End')).toBeVisible()
    await page.reload()
    await activeWorld(page, 'atlas')
    await expect(marker(page, 'Bag End')).toBeVisible()
    await page.getByRole('link', { name: 'Journal', exact: true }).tap()
    const profile = page.getByRole('heading', { name: 'Bilbo Baggins' })
    await expect(profile).toBeVisible()
    const illustration = page.locator('.journal-illustration')
    const portraitBox = (await illustration.boundingBox())!
    const titleBox = (await profile.boundingBox())!
    expect(portraitBox.x + portraitBox.width).toBeLessThan(titleBox.x)
    await expect.poll(() => page.locator('.journal-illustration img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await page.screenshot({ path: testInfo.outputPath('journal-mobile.png'), animations: 'disabled' })
  })
})
