import { pluriel } from '@/libraries/pluriel'

export const statutDesOptions = ({
  ouverte,
  nombre,
  messageSiVide,
}: {
  ouverte: boolean
  nombre: number
  messageSiVide: boolean
}): string => {
  if (!ouverte || (nombre === 0 && messageSiVide)) return ''
  if (nombre === 0) return 'Aucun résultat'
  return `${nombre} ${pluriel(nombre, 'résultat', 'résultats')}`
}
