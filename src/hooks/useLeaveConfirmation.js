import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Menampilkan modal konfirmasi kustom saat pengguna mencoba pindah halaman
// (klik tautan lain di situs, atau tombol back browser), dan konfirmasi
// bawaan browser saat menutup tab/refresh/ketik URL baru.
//
// Panggil `allowLeave()` sebelum melakukan navigate() terprogram yang memang
// diinginkan (misalnya setelah pesanan berhasil dibuat) agar modal tidak muncul.
export function useLeaveConfirmation(active) {
  const navigate = useNavigate()
  const [pendingHref, setPendingHref] = useState(null)
  const [pendingBack, setPendingBack] = useState(false)
  const bypassRef = useRef(false)

  const allowLeave = useCallback(() => {
    bypassRef.current = true
  }, [])

  useEffect(() => {
    if (!active) return

    function handleBeforeUnload(e) {
      if (bypassRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }

    function handleClick(e) {
      if (bypassRef.current) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = e.target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || anchor.target === '_blank') return
      // Abaikan link keluar situs
      if (anchor.origin && anchor.origin !== window.location.origin) return
      if (href === window.location.pathname) return

      e.preventDefault()
      setPendingHref(href)
    }

    function handlePopState() {
      if (bypassRef.current) return
      window.history.pushState(null, '', window.location.pathname)
      setPendingBack(true)
    }

    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [active])

  function confirmLeave() {
    bypassRef.current = true
    if (pendingHref) {
      navigate(pendingHref)
    } else if (pendingBack) {
      navigate('/')
    }
    setPendingHref(null)
    setPendingBack(false)
  }

  function cancelLeave() {
    setPendingHref(null)
    setPendingBack(false)
  }

  return {
    showModal: Boolean(pendingHref || pendingBack),
    confirmLeave,
    cancelLeave,
    allowLeave,
  }
}
