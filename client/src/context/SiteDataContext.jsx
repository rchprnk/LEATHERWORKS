import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCategories, getContact, getSiteData } from '../services/api'

export const DEFAULT_CONTACT = {
  phone: '+1 (847) 899-7312',
  email: 'primeleatherrepair@yahoo.com',
  address: '567 Fairway View Dr #1A, Wheeling, IL 60090',
  workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
  whatsapp: '',
  telegram: '',
}

const SiteDataContext = createContext(null)

function normalizeContact(data) {
  return {
    phone: data?.phone || DEFAULT_CONTACT.phone,
    email: data?.email || DEFAULT_CONTACT.email,
    address: data?.address || DEFAULT_CONTACT.address,
    workingHours: data?.working_hours || DEFAULT_CONTACT.workingHours,
    whatsapp: data?.messenger_whatsapp || DEFAULT_CONTACT.whatsapp,
    telegram: data?.messenger_telegram || DEFAULT_CONTACT.telegram,
  }
}

async function loadSiteData() {
  try {
    const { data } = await getSiteData()
    return {
      contact: normalizeContact(data?.contact),
      categories: Array.isArray(data?.categories) ? data.categories : [],
    }
  } catch (siteDataError) {
    if (siteDataError?.response?.status !== 404) throw siteDataError

    const [contactResult, categoriesResult] = await Promise.allSettled([
      getContact(),
      getCategories(),
    ])

    return {
      contact:
        contactResult.status === 'fulfilled'
          ? normalizeContact(contactResult.value?.data)
          : normalizeContact(null),
      categories:
        categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value?.data)
          ? categoriesResult.value.data
          : [],
    }
  }
}

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

export function useSiteData() {
  const value = useContext(SiteDataContext)
  if (!value) {
    return {
      contact: normalizeContact(null),
      categories: [],
      loading: false,
      ready: true,
    }
  }
  return value
}
