'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinWithSlugPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  useEffect(() => {
    document.cookie = `community-slug=${params.slug}; path=/; max-age=86400; samesite=lax`
    router.replace('/join')
  }, [params.slug, router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950">
      <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full" />
    </div>
  )
}
