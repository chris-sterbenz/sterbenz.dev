const [base, sha] = process.argv.slice(2);
if (!base || !/^[a-f0-9]{40}$/.test(sha || ""))
  throw new Error(
    "Usage: node scripts/verify-deployment.mjs https://host COMMIT_SHA",
  );
const origin = new URL(base);
if (origin.protocol !== "https:")
  throw new Error("Deployment verification requires HTTPS");
async function verify() {
  const options = { signal: AbortSignal.timeout(15000), redirect: "error" };
  const marker = await fetch(
    new URL(`/_build.json?commit=${sha}`, origin),
    options,
  );
  if (!marker.ok || (await marker.json()).sha !== sha)
    throw new Error("Deployed commit does not match");
  const page = await fetch(origin, options);
  if (!page.ok || !(await page.text()).includes("Chris"))
    throw new Error("Landing page is unavailable");
  if (!page.headers.get("content-security-policy"))
    throw new Error("Security headers missing");
  const pdf = await fetch(
    new URL("/chris-sterbenz-resume.pdf", origin),
    options,
  );
  if (
    !pdf.ok ||
    !Buffer.from(await pdf.arrayBuffer())
      .subarray(0, 5)
      .equals(Buffer.from("%PDF-"))
  )
    throw new Error("Resume PDF is unavailable");
  const missing = await fetch(
    new URL("/this-page-does-not-exist", origin),
    options,
  );
  if (missing.status !== 404) throw new Error("Unknown paths must return 404");
}
for (let attempt = 1; attempt <= 12; attempt++) {
  try {
    await verify();
    console.log(`Verified ${origin.origin} at ${sha}`);
    process.exit(0);
  } catch (error) {
    console.error(`Attempt ${attempt}/12: ${error.message}`);
    if (attempt === 12) process.exit(1);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
