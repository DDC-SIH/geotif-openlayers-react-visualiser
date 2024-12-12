import { useState } from 'react'

interface ImageDisplayProps {
  imageUrl: string
}

export function ImageDisplay({ imageUrl }: ImageDisplayProps) {
  const [error, setError] = useState(false)

  if (!imageUrl) return null

  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Generated Image</h3>
        <div className="border rounded-lg overflow-hidden p-4 bg-red-50 text-red-600">
          Unable to display the image due to CORS restrictions. Please use the API URL directly in your application.
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Generated Image</h3>
      <div className="border rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Generated image from TiTiler API"
          width={500}
          height={500}
          className="w-full h-auto"
          onError={() => setError(true)}
        />
      </div>
    </div>
  )
}

