import { getOutilsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/[slug]/outilsPageData'
import { metadataTitle } from '@app/web/app/metadataTitle'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'
import { Outil } from './Outil'

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | null> => {
  const params = await props.params
  const pageData = getOutilsPageData(params.slug)
  if (!pageData) {
    notFound()
    return null
  }

  return {
    title: metadataTitle(`${pageData.title} - Mes outils`),
  }
}

const Page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params
  const pageData = getOutilsPageData(params.slug)

  if (!pageData) {
    notFound()
    return null
  }

  return <Outil {...pageData} />
}

export default Page
