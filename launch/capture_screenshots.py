"""Capture Stampwerk PH gallery screenshots via Playwright."""
import asyncio
from playwright.async_api import async_playwright

BASE = "https://stampwerk.com"
OUT = "/root/flowdesk/launch/screenshots"

# JWT for auth
TOKEN = None

async def get_token():
    import sys
    sys.path.insert(0, "/root/flowdesk")
    import auth
    return auth.create_jwt(1, "a.jinjurikii@gmail.com")

async def main():
    token = await get_token()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1280, "height": 800})

        # Set session cookie
        await ctx.add_cookies([{
            "name": "session",
            "value": token,
            "domain": "stampwerk.com",
            "path": "/"
        }])

        page = await ctx.new_page()

        # 1. Dashboard
        print("1/5 Dashboard...")
        await page.goto(f"{BASE}/dashboard", wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/01_dashboard.png")

        # 2. Invoices page
        print("2/5 Invoices...")
        await page.goto(f"{BASE}/invoices", wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/02_invoices.png")

        # 3. Client portal - proposal (no auth needed)
        print("3/5 Client portal proposal...")
        await page.goto(f"{BASE}/p/prop_rivera_v1", wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/03_client_portal.png", full_page=True)

        # 4. Proposal wizard - fill in step 1 and advance
        print("4/5 Proposal wizard...")
        await page.goto(f"{BASE}/proposals/new", wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/04_proposal_wizard_step1.png")

        # Try to select a project and advance
        try:
            select = page.locator("select")
            await select.select_option(index=1)
            await page.wait_for_timeout(500)

            # Click Continue
            continue_btn = page.get_by_text("Continue", exact=True)
            if await continue_btn.count() > 0:
                await continue_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path=f"{OUT}/04_proposal_wizard_step2.png")
        except Exception as e:
            print(f"  Wizard step 2 failed: {e}")

        # 5. Invoice detail (client-facing)
        print("5/5 Client invoice view...")
        await page.goto(f"{BASE}/i/inv_park_apr", wait_until="networkidle")
        await page.screenshot(path=f"{OUT}/05_client_invoice.png")

        await browser.close()
        print(f"\nDone! Screenshots saved to {OUT}/")

asyncio.run(main())
