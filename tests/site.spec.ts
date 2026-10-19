import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page is accessible and its navigation and downloads work", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "ChrisSterbenz.",
  );
  expect(await page.locator("script").count()).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Links", exact: true })
    .click();
  await expect(page).toHaveURL(/#links$/);
  await expect(
    page.getByRole("heading", { name: "Links", exact: true }),
  ).toBeInViewport();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Experience", exact: true })
    .click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(
    page.getByRole("heading", { name: "Experience", exact: true }),
  ).toBeInViewport();
  await expect(page.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/csterbenz",
  );
  const pdf = await request.get("/chris-sterbenz-resume.pdf");
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});
