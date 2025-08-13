'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    console.log('Test page: Component loaded!')
    setMessage('Test page is working!')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-xl text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-4">If you can see this, client components are working</p>
      </div>
    </div>
  )
}
