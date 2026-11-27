import type { Siret } from '@/libraries/insee'
import { failure, type Result, success } from '@/libraries/result'
import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import { employeuseExistante } from './employeuse-du-siret'
import {
  type EchecDeRattacherAUneEmployeuse,
  IdentiteInexploitable,
  type SireneIndisponible,
  UtilisateurIntrouvable,
} from './errors'
import type { EtablissementSirene } from './etablissement-sirene'
import { MotifSansRattachement } from './motif-sans-rattachement'
import type { LireLEtablissement, RattacherAUneEmployeusePorts } from './ports'
import type { Rattachement } from './rattachement'
import type { SourceDuRattachement } from './source-du-rattachement'

type IdentiteRetenue = Result<
  IdentiteEmployeuse,
  SireneIndisponible | IdentiteInexploitable
>

const identiteRetenue = (
  identite: IdentiteEmployeuse | null,
): IdentiteRetenue =>
  identite === null ? failure(IdentiteInexploitable()) : success(identite)

const identiteDeLEtablissement = (
  etablissement: EtablissementSirene,
): IdentiteRetenue =>
  etablissement._tag === 'Ferme'
    ? failure(IdentiteInexploitable())
    : identiteRetenue(etablissement.identite)

const identiteDuSiret = async (
  lireLEtablissement: LireLEtablissement,
  siret: Siret,
): Promise<IdentiteRetenue> => {
  const etablissement = await lireLEtablissement(siret)

  return etablissement.success
    ? identiteDeLEtablissement(etablissement.data)
    : etablissement
}

export const rattacherAUneEmployeuse =
  ({
    lireLEtablissement,
    lireLeStatutDeConseillerNumerique,
    lireLesEmployeusesDuSiret,
    creerLEmployeuse,
    enregistrerLeRattachement,
  }: RattacherAUneEmployeusePorts) =>
  async ({
    userId,
    source,
  }: {
    readonly userId: UtilisateurId
    readonly source: SourceDuRattachement
  }): Promise<Result<Rattachement, EchecDeRattacherAUneEmployeuse>> => {
    const rattacher = async (
      identite: IdentiteRetenue,
    ): Promise<Result<Rattachement, EchecDeRattacherAUneEmployeuse>> => {
      if (!identite.success) return identite

      const existante = employeuseExistante(
        await lireLesEmployeusesDuSiret(identite.data.siret),
        identite.data.denomination,
      )
      const employeuseId = existante ?? (await creerLEmployeuse(identite.data))

      await enregistrerLeRattachement({ userId, employeuseId })

      return success({
        _tag: 'Rattachee',
        userId,
        employeuseId,
        employeuseCreee: existante === null ? identite.data : null,
      })
    }

    if (source._tag === 'Saisie')
      return rattacher(identiteRetenue(source.identite))

    if (source._tag === 'Siret')
      return rattacher(await identiteDuSiret(lireLEtablissement, source.siret))

    if (source.siret === null)
      return success({
        _tag: 'SansRattachement',
        motif: MotifSansRattachement('SiretAbsent'),
      })

    const statut = await lireLeStatutDeConseillerNumerique(userId)

    if (statut._tag === 'CompteInconnu')
      return failure(UtilisateurIntrouvable())

    if (statut._tag === 'EnPoste')
      return success({
        _tag: 'SansRattachement',
        motif: MotifSansRattachement('ConseillerNumeriqueEnPoste'),
      })

    return rattacher(await identiteDuSiret(lireLEtablissement, source.siret))
  }
