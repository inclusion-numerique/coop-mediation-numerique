'use client'

import { createToast } from '@app/ui/toast/createToast'
import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { getAdresseBanLabel } from '@app/web/external-apis/ban/adresseBanLabel'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import { siretOrRna } from '@app/web/features/structures/rna/rnaValidation'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import type { Typologie } from '@prisma/client'
import { InformationsGeneralesEditionFields } from './InformationsGeneralesEditionFields'
import { InformationsGeneralesView } from './InformationsGeneralesView'
import {
  type InformationsGeneralesFormData,
  informationsGeneralesFormOptions,
} from './informationsGeneralesFormData'

const InformationsGeneralesEditCard = (props: {
  id: string
  nom: string
  adresse: string
  commune: string
  latitude: number | null
  longitude: number | null
  codePostal: string
  codeInsee?: string | null
  lieuItinerant?: boolean | null
  complementAdresse?: string | null
  siret?: string | null
  rna?: string | null
  nomUsage?: string | null
  typologies?: Typologie[] | null
  hasActiveEmployees?: boolean
}) => {
  const mutation = trpc.lieuActivite.updateInformationsGenerales.useMutation()

  const adresseBanData = banDefaultValueToAdresseBanData({
    codeInsee: props.codeInsee ?? undefined,
    codePostal: props.codePostal,
    commune: props.commune,
    nom: props.adresse,
    latitude: props.latitude ?? undefined,
    longitude: props.longitude ?? undefined,
  })
  adresseBanData.label = getAdresseBanLabel(adresseBanData)

  const form = useAppForm({
    ...informationsGeneralesFormOptions,
    defaultValues: {
      id: props.id,
      nom: props.nom,
      adresseBan: adresseBanData,
      lieuItinerant: props.lieuItinerant ?? null,
      complementAdresse: props.complementAdresse ?? null,
      siretSearch: null,
      rna: props.rna ?? null,
      nomUsage: props.nomUsage ?? null,
      noSiret: !props.siret,
      typologies: props.typologies ?? [],
    } as InformationsGeneralesFormData,
    onSubmit: async ({ value }) => {
      if (!value.adresseBan) return

      const { noSiret: _, siretSearch, ...data } = value
      const siret = siretSearch?.siret ?? props.siret ?? null

      try {
        await mutation.mutateAsync({
          ...data,
          siret,
          adresseBan: value.adresseBan,
          ...siretOrRna({ ...data, siret }),
        })
        createToast({
          priority: 'success',
          message: "Le lieu d'activité a bien été modifié.",
        })
      } catch {
        createToast({
          priority: 'error',
          message:
            "Une erreur est survenue lors de l'enregistrement, veuillez réessayer ultérieurement.",
        })
      }
    },
  })

  return (
    <EditCardTanStack
      noBorder
      id="informations-generales"
      title={
        <span className="fr-text-label--blue-france">
          Informations générales
        </span>
      }
      titleAs="h2"
      form={form}
      isPending={mutation.isPending}
      edition={
        <form.AppForm>
          <InformationsGeneralesEditionFields
            form={form}
            isPending={mutation.isPending}
            hasActiveEmployees={props.hasActiveEmployees}
          />
        </form.AppForm>
      }
      view={<InformationsGeneralesView {...props} />}
    />
  )
}

export default withTrpc(InformationsGeneralesEditCard)
