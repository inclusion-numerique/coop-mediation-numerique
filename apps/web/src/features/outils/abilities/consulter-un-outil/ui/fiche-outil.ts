import { Pictogram } from '@app/web/features/pictograms/pictogram'
import type { ReactNode } from 'react'

export type FonctionnaliteDeLOutil = {
  title: string
  description: string
  icon: string
  link?: string
}

export type InformationDAcces = {
  label: string
  link: string
  share?: boolean
}

export type AccesALOutil = {
  how: ReactNode
  icon?: string
  illustration?: string
  info?: InformationDAcces
  title?: string
  description?: string
  callToActionComponent?: ReactNode
  callToAction?: {
    label: string
    link: string
  }
}

export type FicheOutil = {
  notice?: string
  title: string
  description: string
  website: string
  websiteLinkLabel?: string
  pictogram: Pictogram
  illustration: string
  illustrationWidth?: number
  features?: FonctionnaliteDeLOutil[]
  access?: AccesALOutil
  how?: ReactNode
  more?: ReactNode
  classes?: {
    access?: string
  }
}
