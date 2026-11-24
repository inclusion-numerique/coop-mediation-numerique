'use client'

import SkipLinks from '@codegouvfr/react-dsfr/SkipLinks'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { defaultSkipLinks } from '@/libraries/liens-d-evitement/skip-links'

const SkipLinksPortal = ({
  links = defaultSkipLinks,
  elementId = 'skip-links',
}: {
  links?: { label: string; anchor: string }[]
  elementId?: string
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  return isMounted
    ? createPortal(
        <SkipLinks links={links} />,
        document.getElementById(elementId) ?? document.body,
      )
    : null
}
export default SkipLinksPortal
