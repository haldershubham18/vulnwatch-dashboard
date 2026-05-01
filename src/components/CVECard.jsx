function getCvssScore(cve) {
  const m = cve.metrics
  return (
    m?.cvssMetricV31?.[0]?.cvssData ||
    m?.cvssMetricV30?.[0]?.cvssData ||
    m?.cvssMetricV2?.[0]?.cvssData ||
    null
  )
}

function getSeverityStyle(severity) {
  switch (severity) {
    case "CRITICAL": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-700"
    case "HIGH": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border border-orange-300 dark:border-orange-700"
    case "MEDIUM": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
    case "LOW": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border border-green-300 dark:border-green-700"
    default: return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
  }
}

export default function CVECard({ cveItem }) {
  const cve = cveItem.cve
  const cvssData = getCvssScore(cve)
  const score = cvssData?.baseScore ?? null
  const severity = cvssData?.baseSeverity ?? "N/A"
  const description = cve.descriptions?.find((d) => d.lang === "en")?.value || "No description available."
  const published = new Date(cve.published).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric"
  })

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="font-bold text-blue-600 dark:text-blue-400 text-sm">{cve.id}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {score !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{score.toFixed(1)}</span>
          )}
          <span className={`text-xs px-2 py-0.5 font-semibold ${getSeverityStyle(severity)}`}>
            {severity}
          </span>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
        {description}
      </p>

      <div className="text-xs text-gray-400 dark:text-gray-500">
        Published: {published}
      </div>
    </div>
  )
}
