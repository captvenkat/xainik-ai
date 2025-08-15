'use client'

import { useState, useEffect } from 'react'
import { QrCode, Download, Share2 } from 'lucide-react'

interface QRCodeGeneratorProps {
  pitchId: string
  pitchTitle: string
  className?: string
}

export default function QRCodeGenerator({ 
  pitchId, 
  pitchTitle, 
  className = '' 
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const pitchUrl = `${window.location.origin}/pitch/${pitchId}`

  useEffect(() => {
    if (showQR && !qrCodeUrl) {
      generateQRCode()
    }
  }, [showQR, qrCodeUrl])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Using a QR code API service
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pitchUrl)}`
      setQrCodeUrl(qrApiUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pitch-qr-${pitchId}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    }
  }

  const toggleQR = () => {
    setShowQR(!showQR)
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={toggleQR}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        title="Generate QR Code"
      >
        <QrCode className="w-4 h-4" />
        <span>QR Code</span>
      </button>

      {showQR && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">QR Code for Pitch</h3>
            <p className="text-sm text-gray-600 mb-4">{pitchTitle}</p>
            
            {isGenerating ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for pitch" 
                    className="border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(pitchUrl)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Link
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>Scan this QR code to view the pitch on your phone</p>
                  <p className="mt-1">Perfect for in-person networking!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
