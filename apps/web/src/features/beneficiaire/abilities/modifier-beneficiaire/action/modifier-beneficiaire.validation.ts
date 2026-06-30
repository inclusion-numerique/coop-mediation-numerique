import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { ContactTelephone } from '@app/web/features/beneficiaire/domain/contact-telephone'
import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { beneficiaireFormShape } from '@app/web/features/beneficiaire/forms/beneficiaire-form'
import type { BeneficiaireAModifier } from '../domain/beneficiaire-a-modifier'

export const ModifierBeneficiaireValidation = beneficiaireFormShape
  .extend({ id: BeneficiaireId.schema })
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
      statutSocial: StatutSocial(form.statutSocial),
      notes: form.notes ?? null,
    }),
  )
