import { useState, useEffect, useRef } from "react"
import Navbar from "./components/Navbar"
import CVECard from "./components/CVECard"
import { getCVEs } from "./utils/api"

const PER_PAGE = 10

function getCvssScore(cveItem) {
  const m = cveItem.cve.metrics
  return (
    m?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
    m?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
    m?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
    0
  )
}

export default function App() {
  const [cveList, setCveList] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [searchInput, setSearchInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [severity, setSeverity] = useState("")
  const [sortBy, setSortBy] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)

  const debounceRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError("")
      try {
        const data = await getCVEs(keyword, severity, currentPage, PER_PAGE)
        setCveList(data.vulnerabilities || [])
        setTotalResults(data.totalResults || 0)
      } catch (err) {
        setError("Could not fetch data. Please try again after some time.")
        setCveList([])
      }
      setLoading(false)
    }

    fetchData()
  }, [keyword, severity, currentPage])

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchInput(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setKeyword(value)
      setCurrentPage(1)
    }, 700)
  }

  function handleSeverityChange(e) {
    setSeverity(e.target.value)
    setCurrentPage(1)
  }

  const sortedList = [...cveList].sort((a, b) => {
    const scoreA = getCvssScore(a)
    const scoreB = getCvssScore(b)
    
    if (scoreA === 0 && scoreB === 0) return 0
    if (scoreA === 0) return 1
    if (scoreB === 0) return -1
    
    if (sortBy === "desc") {
      return scoreB - scoreA
    } else {
      return scoreA - scoreB
    }
  })

  const totalPages = Math.min(Math.ceil(totalResults / PER_PAGE), 100)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">CVE Threat Explorer</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live vulnerability data from the National Vulnerability Database (NVD) · NIST
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Search
              </label>
              <input
                type="text"
                placeholder="e.g. apache, windows, buffer overflow..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Severity
              </label>
              <select
                value={severity}
                onChange={handleSeverityChange}
                className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Sort by Score
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="desc">High → Low</option>
                <option value="asc">Low → High</option>
              </select>
            </div>
          </div>
        </div>

        {!loading && !error && cveList.length > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {totalResults.toLocaleString()} results found
            {keyword && ` for "${keyword}"`}
            {severity && ` · ${severity}`}
            {" "}· Page {currentPage} of {totalPages}
          </p>
        )}

        {error && (
          <div className="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
            Fetching data...
          </div>
        )}

        {!loading && !error && sortedList.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
            No results found.
          </div>
        )}

        {!loading && sortedList.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {sortedList.map((item) => (
              <CVECard key={item.cve.id} cveItem={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-1.5 flex-wrap mt-4">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ← Prev
            </button>

            {pageNumbers.map((p, i) => {
              const showDots = i > 0 && pageNumbers[i - 1] !== p - 1
              return (
                <span key={p} className="flex items-center gap-1.5">
                  {showDots && (
                    <span className="text-gray-400 text-sm px-1">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 text-sm border ${
                      p === currentPage
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              )
            })}

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
