interface ErrorStateProps {
  error: string
  onRetry?: () => void
  fullScreen?: boolean
}

export default function ErrorState({ 
  error, 
  onRetry,
  fullScreen = false 
}: ErrorStateProps) {
  const errorContent = (
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {errorContent}
      </div>
    )
  }

  return errorContent
}
