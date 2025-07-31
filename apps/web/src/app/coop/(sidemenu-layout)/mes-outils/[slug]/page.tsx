import { Outil } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/[slug]/Outil'
import { getOutilsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/[slug]/outilsPageData'
import { metadataTitle } from '@app/web/app/metadataTitle'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | null> => {
  const params = await props.params
  const pageData = getOutilsPageData(params.slug)

  return pageData
    ? { title: metadataTitle(`${pageData.title} - Mes outils`) }
    : notFound()
}

const Page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params
  const pageData = getOutilsPageData(params.slug)

  return pageData ? <Outil {...pageData} /> : notFound()
}

export default Page
