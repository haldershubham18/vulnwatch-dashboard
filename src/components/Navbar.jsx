import { useTheme } from "../context/ThemeContext"

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center border-b border-gray-700">
      <div>
        <h1 className="text-lg font-bold tracking-wide">VulnWatch Dashboard</h1>
        <p className="text-gray-400 text-xs mt-0.5">Cybersecurity Threat Explorer · NVD / NIST</p>
      </div>
      <button
        onClick={toggleDarkMode}
        className="text-sm px-4 py-1.5 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white transition-colors"
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </nav>
  )
}
