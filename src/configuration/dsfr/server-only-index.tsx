import {
  createGetHtmlAttributes,
  DsfrHeadBase,
  type DsfrHeadProps,
} from '@codegouvfr/react-dsfr/next-app-router/server-only-index'
import Link from 'next/link'
import { defaultColorScheme } from './defaultColorScheme'

export const { getHtmlAttributes } = createGetHtmlAttributes({
  defaultColorScheme,
})

export const DsfrHead = (props: DsfrHeadProps) => (
  <DsfrHeadBase Link={Link} {...props} />
)
