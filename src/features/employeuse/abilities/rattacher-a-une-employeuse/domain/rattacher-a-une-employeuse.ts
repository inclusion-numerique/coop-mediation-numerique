import { failure, type Result, success } from '@/libraries/result'
import {
  IdentiteEmployeuse,
  identiteDepuisEtablissement,
} from '../../../domain/identite-employeuse'
import { employeuseExistante } from './employeuse-du-siret'
import {
  type EchecDeRattacherAUneEmployeuse,
  type EmployeuseIndisponible,
  IdentiteInexploitable,
  UtilisateurIntrouvable,
} from './errors'
import type { LireLEtablissement, RattacherAUneEmployeusePorts } from './ports'
import type { Rattachement } from './rattachement'
import type {
  SaisieEmployeuse,
  SourceDuRattachement,
} from './source-du-rattachement'

type IdentiteRetenue = Result<
  IdentiteEmployeuse,
  EmployeuseIndisponible | IdentiteInexploitable
>

const identiteRetenue = (
  identite: IdentiteEmployeuse | null,
): IdentiteRetenue =>
  identite === null ? failure(IdentiteInexploitable()) : success(identite)

const identiteSaisie = (saisie: SaisieEmployeuse): IdentiteRetenue =>
  identiteRetenue(IdentiteEmployeuse.safe(saisie))

const identiteDuSiret = async (
  lireLEtablissement: LireLEtablissement,
  siret: string,
): Promise<IdentiteRetenue> => {
  const etablissement = await lireLEtablissement(siret)

  return etablissement.success
    ? identiteRetenue(identiteDepuisEtablissement(etablissement.data))
    : etablissement
}

export const rattacherAUneEmployeuse =
  ({
    lireLEtablissement,
    estConseillerNumeriqueEnPoste,
    lireLesEmployeusesDuSiret,
    creerLEmployeuse,
    enregistrerLeRattachement,
  }: RattacherAUneEmployeusePorts) =>
  async ({
    userId,
    source,
  }: {
    readonly userId: string
    readonly source: SourceDuRattachement
  }): Promise<Result<Rattachement, EchecDeRattacherAUneEmployeuse>> => {
    const rattacher = async (
      identite: IdentiteRetenue,
    ): Promise<Result<Rattachement, EchecDeRattacherAUneEmployeuse>> => {
      if (!identite.success) return identite

      const homonymes = await lireLesEmployeusesDuSiret(identite.data.siret)

      if (!homonymes.success) return homonymes

      const existante = employeuseExistante(
        homonymes.data,
        identite.data.denomination,
      )
      const employeuse =
        existante === null
          ? await creerLEmployeuse(identite.data)
          : success(existante)

      if (!employeuse.success) return employeuse

      await enregistrerLeRattachement({ userId, employeuseId: employeuse.data })

      return success({
        _tag: 'Rattachee',
        userId,
        employeuseId: employeuse.data,
        employeuseCreee: existante === null ? identite.data : null,
      })
    }

    if (source._tag === 'Saisie')
      return rattacher(identiteSaisie(source.saisie))

    if (source._tag === 'Siret')
      return rattacher(await identiteDuSiret(lireLEtablissement, source.siret))

    if (source.siret === null)
      return success({ _tag: 'SansRattachement', motif: 'SiretAbsent' })

    const conseillerNumerique = await estConseillerNumeriqueEnPoste(userId)

    if (conseillerNumerique === null) return failure(UtilisateurIntrouvable())

    if (conseillerNumerique)
      return success({
        _tag: 'SansRattachement',
        motif: 'ConseillerNumeriqueEnPoste',
      })

    return rattacher(await identiteDuSiret(lireLEtablissement, source.siret))
  }
