

// components/BeginMatchButton.tsx
'use client'
import { useRouter } from 'next/navigation'

export default function BeginMatchButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/selectMatch`)
  }

  return (
    <button
      className="btn btn-secondary px-8 py-4 text-lg"
      onClick={handleClick}
    >
      Register a New Match
    </button>
  )
}
