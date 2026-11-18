import os
import unittest

from playwright.sync_api import expect, sync_playwright


class ExplorerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.addClassCleanup(cls.playwright.stop)
        cls.browser = cls.playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH")
        )
        cls.addClassCleanup(cls.browser.close)

    def setUp(self):
        self.page = self.browser.new_page(viewport={"width": 375, "height": 820})
        self.addCleanup(self.page.close)
        self.url = "http://127.0.0.1:8000"

    def test_notebook_values_and_controls(self):
        errors = []
        self.page.on("pageerror", lambda error: errors.append(str(error)))
        self.page.goto(self.url)
        end = self.page.get_by_label("End month")
        expect(end).to_be_enabled()
        end.fill("1958-03")
        end.press("Tab")
        expect(self.page.get_by_role("status")).to_contain_text("1 month with data")
        self.page.locator("summary").focus()
        self.page.keyboard.press("Enter")
        expect(self.page.get_by_role("row").nth(1).get_by_role("cell")).to_have_text(
            ["Mar 1958", "315.71", "314.44"]
        )
        self.page.get_by_label("Series").select_option("adjusted")
        expect(self.page.get_by_role("row").nth(1).get_by_role("cell")).to_have_text(
            ["Mar 1958", "314.44"]
        )
        self.page.get_by_label("Start month").fill("1958-04")
        self.page.get_by_label("Start month").press("Tab")
        expect(self.page.get_by_role("status")).to_contain_text("Choose a valid date range")
        self.page.get_by_role("button", name="Reset dates").click()
        expect(self.page.get_by_role("img")).to_be_visible()
        self.assertTrue(self.page.evaluate("document.documentElement.scrollWidth === innerWidth"))
        self.assertEqual(errors, [])

    def test_failed_request(self):
        self.page.route("**/noaa-co2.txt", lambda route: route.abort())
        self.page.goto(self.url)
        expect(self.page.get_by_role("status")).to_contain_text("could not be loaded")
        expect(self.page.get_by_label("Series")).to_be_disabled()

    def test_missing_value(self):
        fixture = (
            "1958 3 1958.2027 -99.99 314.44 -1 -9.99 -0.99\n"
            "1958 4 1958.2877 317.45 315.16 -1 -9.99 -0.99\n"
        )
        self.page.route("**/noaa-co2.txt", lambda route: route.fulfill(body=fixture))
        self.page.goto(self.url)
        expect(self.page.get_by_label("Series")).to_be_enabled()
        self.page.get_by_label("Series").select_option("monthly")
        self.page.get_by_label("End month").fill("1958-03")
        self.page.get_by_label("End month").press("Tab")
        expect(self.page.get_by_role("status")).to_contain_text("No CO₂ values")
        expect(self.page.get_by_role("img")).to_be_hidden()
