import { z } from 'zod'

const facultatif = z
  .string()
  .nullish()
  .transform((valeur) => valeur ?? null)

const UtilisateurALaConnexion = z.object({
  id: z.string(),
  email: z.string(),
  firstName: facultatif,
  lastName: facultatif,
  phone: facultatif,
  siret: facultatif,
})

export const lireLUtilisateurALaConnexion = (utilisateur: unknown) =>
  UtilisateurALaConnexion.safeParse(utilisateur)
