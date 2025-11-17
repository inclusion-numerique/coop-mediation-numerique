import { ReactNode } from 'react'

export const CountWithLabel = ({
  count,
  label,
  prefix,
}: {
  count: number
  label: string
  prefix?: ReactNode
}) =>
  count === 0 ? null : (
    <>
      {prefix}
      {count} {count > 1 ? `${label}s` : label}
    </>
  )
