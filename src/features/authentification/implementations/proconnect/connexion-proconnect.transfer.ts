import { z } from 'zod'

const facultatif = z
  .string()
  .nullish()
  .transform((valeur) => valeur ?? null)

const jeton = z
  .string()
  .nullish()
  .transform((valeur) => valeur ?? undefined)

const ConnexionProConnect = z.object({
  user: z.object({
    id: z.string(),
    firstName: facultatif,
    lastName: facultatif,
    phone: facultatif,
    siret: facultatif,
  }),
  profile: z.object({
    given_name: z.string(),
    usual_name: z.string(),
    phone_number: facultatif,
    siret: facultatif,
  }),
  account: z
    .object({
      provider: z.string(),
      access_token: jeton,
      refresh_token: jeton,
      expires_at: z
        .number()
        .nullish()
        .transform((valeur) => valeur ?? undefined),
      id_token: jeton,
      scope: jeton,
    })
    .nullish()
    .transform((valeur) => valeur ?? null),
})

export type ConnexionProConnect = z.output<typeof ConnexionProConnect>

export const lireLaConnexionProConnect = (connexion: unknown) =>
  ConnexionProConnect.safeParse(connexion)
