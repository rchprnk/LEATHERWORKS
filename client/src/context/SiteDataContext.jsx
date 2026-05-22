import { useEffect, useMemo, useState } from 'react'
import { loadSiteData, normalizeContact, SiteDataContext } from './siteData.js'

export function SiteDataProvider({ children }) {
  const [state, setState] = useState({
    contact: normalizeContact(null),
    categories: [],
    loading: true,
    ready: false,
  })

  useEffect(() => {
    let alive = true

    loadSiteData()
      .then((data) => {
        if (!alive) return
        setState({
          contact: data.contact,
          categories: data.categories,
          loading: false,
          ready: true,
        })
      })
      .catch(() => {
        if (!alive) return
        setState({
          contact: normalizeContact(null),
          categories: [],
          loading: false,
          ready: true,
        })
      })

    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => state, [state])

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}
