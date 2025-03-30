import React from "react"

const Header = () => {
  const scanFolder = localStorage.getItem("scanFolder") || "No configurado"

  return (
    <div className="py-3 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">Carpeta de escaneo:</span>
          <span className="font-bold text-gray-700 dark:text-gray-300 max-w-md truncate">
            {scanFolder}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Header
