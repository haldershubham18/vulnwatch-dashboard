const BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

export async function getCVEs(keyword, severity, page, perPage) {
  let url = `${BASE_URL}?startIndex=${(page - 1) * perPage}&resultsPerPage=${perPage}`

  if (keyword) url += `&keywordSearch=${encodeURIComponent(keyword)}`
  if (severity) url += `&cvssV3Severity=${severity}`

  const response = await fetch(url)
  if (!response.ok) throw new Error("Failed to fetch data from NVD API")

  return await response.json()
}
