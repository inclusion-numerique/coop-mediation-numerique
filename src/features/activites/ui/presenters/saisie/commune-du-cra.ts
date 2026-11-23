import z from 'zod'

export const CommuneDuCraValidation = z.object(
  {
    id: z.string(),
    label: z.string(),
    commune: z.string(),
    codePostal: z.string(),
    codeInsee: z.string(),
  },
  { error: 'Veuillez renseigner une commune' },
)

export type CommuneDuCra = z.infer<typeof CommuneDuCraValidation>

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
