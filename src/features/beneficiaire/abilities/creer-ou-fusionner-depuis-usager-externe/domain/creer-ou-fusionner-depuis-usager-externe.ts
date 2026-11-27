import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { effectiveTrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import {
  type EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import {
  type EchecDeCreerOuFusionnerDepuisUsagerExterne,
  IdentiteIncomplete,
  type MotifDEcart,
} from './errors'
import type { EcritureDUnUsager, FusionDesUsagers } from './fusion-des-usagers'
import type { CreerOuFusionnerDepuisUsagerExternePorts } from './ports'
import type {
  DonneesDeFusion,
  IdentiteConnue,
  MergedBeneficiaire,
  UsagerNormalise,
} from './usager-externe'

const donneesDeFusion = ({
  usager,
  existant,
  dejaLie,
  residenceConnue,
  commune,
  maintenant,
}: {
  readonly usager: UsagerNormalise
  readonly existant: IdentiteConnue
  readonly dejaLie: boolean
  readonly residenceConnue: boolean
  readonly commune: CommuneResidence | null
  readonly maintenant: Date
}): DonneesDeFusion => ({
  ...(dejaLie ? {} : { rdvUserId: usager.rdvUserId }),
  ...(usager.email && !existant.email ? { email: usager.email } : {}),
  ...(usager.telephone && !existant.telephone
    ? { telephone: usager.telephone }
    : {}),
  ...(usager.prenom && !existant.prenom ? { prenom: usager.prenom } : {}),
  ...(usager.nom && !existant.nom ? { nom: usager.nom } : {}),
  ...(usager.adresse && !residenceConnue ? { adresse: usager.adresse } : {}),
  ...(usager.anneeNaissance && !existant.anneeNaissance
    ? {
        anneeNaissance: usager.anneeNaissance,
        trancheAge: effectiveTrancheAge(
          usager.anneeNaissance,
          null,
          maintenant,
        ),
      }
    : {}),
  ...(commune
    ? {
        commune: commune.commune,
        communeCodePostal: commune.codePostal,
        communeCodeInsee: commune.codeInsee,
      }
    : {}),
})

type IssueDUnUsager = {
  readonly beneficiaire: MergedBeneficiaire
  readonly ecriture: EcritureDUnUsager | null
}

const ecrit =
  (ecriture: EcritureDUnUsager) =>
  (
    resultat: Result<MergedBeneficiaire, EchecTechnique>,
  ): Result<IssueDUnUsager, EchecTechnique> =>
    resultat.success
      ? success({ beneficiaire: resultat.data, ecriture })
      : resultat

const traiterUnUsager =
  (
    {
      lireLeBeneficiaireLie,
      trouverUnDoublon,
      communeDeLAdresse,
      mettreAJourLeBeneficiaire,
      creerLeBeneficiaire,
    }: CreerOuFusionnerDepuisUsagerExternePorts,
    mediateurId: MediateurId,
    maintenant: Date,
  ) =>
  async (
    usager: UsagerNormalise,
  ): Promise<Result<IssueDUnUsager, MotifDEcart>> => {
    const communeSiInconnue = (
      communeConnue: boolean,
    ): Promise<Result<CommuneResidence | null, EchecTechnique>> =>
      usager.adresse && !communeConnue
        ? communeDeLAdresse(usager.adresse)
        : Promise.resolve(success(null))

    const lie = await lireLeBeneficiaireLie({
      rdvUserId: usager.rdvUserId,
      mediateurId,
      maintenant,
    })
    if (!lie.success) return lie

    if (lie.data !== null) {
      const beneficiaireLie = lie.data
      const commune = await communeSiInconnue(Boolean(beneficiaireLie.commune))
      if (!commune.success) return commune
      const donnees = donneesDeFusion({
        usager,
        existant: beneficiaireLie,
        dejaLie: true,
        residenceConnue: false,
        commune: commune.data,
        maintenant,
      })
      const miseAJour = { id: beneficiaireLie.id, mediateurId, donnees }
      return Object.keys(donnees).length > 0
        ? ecrit({ _tag: 'MiseAJour', ...miseAJour })(
            await mettreAJourLeBeneficiaire({ ...miseAJour, maintenant }),
          )
        : success({ beneficiaire: beneficiaireLie, ecriture: null })
    }

    const doublon = await trouverUnDoublon({
      nom: usager.nom,
      prenom: usager.prenom,
      telephone: usager.telephone,
      email: usager.email,
      mediateurId,
    })
    if (!doublon.success) return doublon

    if (doublon.data !== null) {
      const { id, communeResidence } = doublon.data
      const commune = await communeSiInconnue(communeResidence !== null)
      if (!commune.success) return commune
      const miseAJour = {
        id,
        mediateurId,
        donnees: donneesDeFusion({
          usager,
          existant: doublon.data,
          dejaLie: false,
          residenceConnue: communeResidence !== null,
          commune: commune.data,
          maintenant,
        }),
      }
      return ecrit({ _tag: 'MiseAJour', ...miseAJour })(
        await mettreAJourLeBeneficiaire({ ...miseAJour, maintenant }),
      )
    }

    if (usager.nom === null || usager.prenom === null)
      return failure(IdentiteIncomplete(usager.rdvUserId))

    const commune = await communeSiInconnue(false)
    if (!commune.success) return commune

    const beneficiaire = {
      rdvUserId: usager.rdvUserId,
      nom: usager.nom,
      prenom: usager.prenom,
      telephone: usager.telephone,
      email: usager.email,
      adresse: usager.adresse,
      anneeNaissance: usager.anneeNaissance,
      trancheAge: effectiveTrancheAge(usager.anneeNaissance, null, maintenant),
      commune: commune.data?.commune ?? null,
      communeCodePostal: commune.data?.codePostal ?? null,
      communeCodeInsee: commune.data?.codeInsee ?? null,
      mediateurId,
    }
    return ecrit({ _tag: 'Creation', beneficiaire })(
      await creerLeBeneficiaire({ beneficiaire, maintenant }),
    )
  }

export const creerOuFusionnerDepuisUsagerExterne =
  ({
    lireLeBeneficiaireLie,
    trouverUnDoublon,
    communeDeLAdresse,
    mettreAJourLeBeneficiaire,
    creerLeBeneficiaire,
  }: CreerOuFusionnerDepuisUsagerExternePorts) =>
  async ({
    usagers,
    mediateurId,
    maintenant,
  }: {
    readonly usagers: readonly UsagerNormalise[]
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<
    Result<FusionDesUsagers, EchecDeCreerOuFusionnerDepuisUsagerExterne>
  > => {
    const traiter = traiterUnUsager(
      {
        lireLeBeneficiaireLie,
        trouverUnDoublon,
        communeDeLAdresse,
        mettreAJourLeBeneficiaire,
        creerLeBeneficiaire,
      },
      mediateurId,
      maintenant,
    )
    const issues = await Promise.all(
      usagers.map(async (usager) => ({
        rdvUserId: usager.rdvUserId,
        issue: await traiter(usager),
      })),
    )

    return success({
      merges: issues.flatMap(({ issue }) =>
        issue.success ? [issue.data.beneficiaire] : [],
      ),
      skipped: issues.flatMap(({ rdvUserId, issue }) =>
        issue.success ? [] : [{ rdvUserId, reason: issue.error }],
      ),
      ecritures: issues.flatMap(({ issue }) =>
        issue.success && issue.data.ecriture !== null
          ? [issue.data.ecriture]
          : [],
      ),
    })
  }
