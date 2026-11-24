import type { CommuneDuCra } from '../../forms/commune-du-cra.validation'

export type CommuneConnue = {
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
}

export const communeDuCra = ({
  commune,
  codePostal,
  codeInsee,
}: CommuneConnue): CommuneDuCra => ({
  id: codeInsee,
  label: `${commune} · ${codePostal}`,
  commune,
  codePostal,
  codeInsee,
})
