'use client'
import { useEffect } from 'react'

export function StripSkipGuard() {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get('__skip_guard') === '1') {
      url.searchParams.delete('__skip_guard')
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash)
    }
  }, [])
  return null
}
