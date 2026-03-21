/**
 * finder.ts — Workaround enrichment for LinkedIn connections
 *
 * Since LinkedIn has no public connections API, this module uses:
 * 1. Google site: search to find likely profile URLs from name + company
 * 2. Hunter.io (optional) to find emails
 * 3. Clearbit (optional) to find company data
 *
 * All methods respect rate limits and never scrape LinkedIn directly.
 */

export interface EnrichmentResult {
  linkedinUrl?: string;
  email?: string;
  companyDomain?: string;
  companySize?: string;
  industry?: string;
  twitterHandle?: string;
}

/** Build a Google search URL to find someone's LinkedIn profile */
export function buildLinkedInSearchUrl(
  name: string,
  company?: string
): string {
  const query = company
    ? `site:linkedin.com/in "${name}" "${company}"`
    : `site:linkedin.com/in "${name}"`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** Use Hunter.io to find an email given name + company domain */
export async function findEmailViaHunter(
  firstName: string,
  lastName: string,
  domain: string,
  apiKey: string
): Promise<string | null> {
  try {
    const url = new URL("https://api.hunter.io/v2/email-finder");
    url.searchParams.set("first_name", firstName);
    url.searchParams.set("last_name", lastName);
    url.searchParams.set("domain", domain);
    url.searchParams.set("api_key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { email?: string } };
    return data?.data?.email ?? null;
  } catch {
    return null;
  }
}

/** Use Clearbit Autocomplete to find company domain from name */
export async function findCompanyDomain(
  companyName: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`
    );
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ domain?: string }>;
    return results?.[0]?.domain ?? null;
  } catch {
    return null;
  }
}

/** Full enrichment pipeline for a single person */
export async function enrichConnection(opts: {
  firstName: string;
  lastName: string;
  company: string;
  hunterApiKey?: string;
}): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {};

  // Step 1: Find company domain via Clearbit (free, no key needed)
  if (opts.company) {
    result.companyDomain = (await findCompanyDomain(opts.company)) ?? undefined;
  }

  // Step 2: Find email via Hunter (requires free API key)
  if (opts.hunterApiKey && result.companyDomain) {
    result.email =
      (await findEmailViaHunter(
        opts.firstName,
        opts.lastName,
        result.companyDomain,
        opts.hunterApiKey
      )) ?? undefined;
  }

  return result;
}
