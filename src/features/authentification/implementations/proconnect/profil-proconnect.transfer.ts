import jwt from 'jsonwebtoken'
import { z } from 'zod'

const facultatif = z
  .string()
  .nullish()
  .transform((valeur) => valeur ?? null)

const ProfilProConnect = z.looseObject({
  sub: z.string(),
  email: z.string(),
  given_name: z.string(),
  usual_name: z.string(),
  phone_number: facultatif,
  siret: facultatif,
})

export type ProfilProConnect = z.output<typeof ProfilProConnect>

export const profilProConnectDuJeton = (jeton: string): ProfilProConnect =>
  ProfilProConnect.parse(jwt.decode(jeton))
