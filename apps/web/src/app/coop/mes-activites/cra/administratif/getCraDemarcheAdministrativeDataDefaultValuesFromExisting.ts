import { DefaultValues } from 'react-hook-form'
import { CraDemarcheAdministrativeData } from '@app/web/cra/CraDemarcheAdministrativeValidation'
import { prismaClient } from '@app/web/prismaClient'
import { DureeAccompagnement } from '@app/web/cra/cra'
import { getBeneficiaireDefaulCratDataFromExisting } from '@app/web/app/coop/mes-activites/cra/getBeneficiaireDefaulCratDataFromExisting'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'

export const getCraDemarcheAdministrativeDataDefaultValuesFromExisting =
  async ({
    id,
    mediateurId,
  }: {
    id: string
    mediateurId: string
  }): Promise<
    | (DefaultValues<CraDemarcheAdministrativeData> & {
        id: string
        mediateurId: string
      })
    | null
  > => {
    const cra = await prismaClient.activite.findUnique({
      where: {
        id,
        mediateurId,
        suppression: null,
        type: 'Demarche',
      },
      select: {
        accompagnements: {
          select: {
            beneficiaire: true,
          },
        },
        date: true,
        duree: true,
        typeLieu: true,
        lieuCodeInsee: true,
        lieuCodePostal: true,
        lieuCommune: true,
        structureId: true,
        notes: true,
        precisionsDemarche: true,
        structureDeRedirection: true,
        thematiquesDemarche: true,
        degreDeFinalisation: true,
        autonomie: true,
      },
    })

    if (!cra) {
      return null
    }

    const {
      accompagnements,
      date,
      duree,
      notes,
      autonomie,
      degreDeFinalisation,
      thematiquesDemarche,
      structureDeRedirection,
      precisionsDemarche,
      typeLieu,
      lieuCodeInsee,
      lieuCodePostal,
      lieuCommune,
      structureId,
    } = cra

    const beneficiaire = accompagnements[0]?.beneficiaire

    const defaultValues = {
      id,
      mediateurId,
      beneficiaire: beneficiaire
        ? getBeneficiaireDefaulCratDataFromExisting(beneficiaire)
        : { mediateurId },
      date: dateAsIsoDay(date),
      duree: duree.toString() as DureeAccompagnement,
      notes: notes ?? undefined,
      autonomie: autonomie ?? undefined,
      degreDeFinalisation: degreDeFinalisation ?? undefined,
      thematiques: thematiquesDemarche ?? undefined,
      structureDeRedirection: structureDeRedirection ?? undefined,
      precisionsDemarche: precisionsDemarche ?? undefined,
      structureId: structureId ?? undefined,
      lieuAccompagnementDomicileCommune:
        lieuCommune && lieuCodePostal && lieuCodeInsee
          ? banDefaultValueToAdresseBanData({
              commune: lieuCommune ?? undefined,
              codePostal: lieuCodePostal ?? undefined,
              codeInsee: lieuCodeInsee ?? undefined,
            })
          : undefined,
      typeLieu: typeLieu ?? undefined,
    } satisfies DefaultValues<CraDemarcheAdministrativeData>

    return defaultValues
  }