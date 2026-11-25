import { z } from 'zod'
import { beneficiaireFormShape } from '@/features/beneficiaire/action/champs-du-beneficiaire.validation'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { ContactTelephone } from '@/features/beneficiaire/domain/contact-telephone'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import type { BeneficiaireAModifier } from '../domain/beneficiaire-a-modifier'

export const ModifierBeneficiaireValidation = beneficiaireFormShape
  .extend({ id: z.string().nullish().pipe(BeneficiaireId.schema) })
  .transform(
    ({ id, ...form }): BeneficiaireAModifier => ({
      id,
      prenom: form.prenom,
      nom: form.nom,
      contactTelephone: ContactTelephone(form.telephone, form.pasDeTelephone),
      email: form.email ?? null,
      anneeNaissance: form.anneeNaissance ?? null,
      communeResidence: form.communeResidence ?? null,
      genre: Genre(form.genre),
      trancheAge: form.trancheAge,
      statutSocial: StatutSocial(form.statutSocial),
      notes: form.notes ?? null,
    }),
  )
