'use client'

import { createToast } from '@app/ui/toast/createToast'
import type {
  LienDuPerimetre,
  PerimetrePartage,
} from '@app/web/features/mediateurs/domain'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '../action/regler-le-partage-statistiques.key'

const PartageStatistiquesModal = createModal({
  id: 'partage-statistiques',
  isOpenedByDefault: false,
})

const titreDuPerimetre = (perimetre: PerimetrePartage): string =>
  perimetre === 'Coordinateur'
    ? 'Statistiques de mon équipe, mes activités incluses'
    : 'Mes statistiques'

const LigneDePartage = ({
  lienDuPerimetre: { perimetre, lien },
  titre,
}: {
  lienDuPerimetre: LienDuPerimetre
  titre: string | null
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  const partage = lien !== null

  const basculer = () =>
    demarrer(async () => {
      const actif = !partage
      const resultat = await inject(REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY)({
        actif,
        perimetre,
      })

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message:
            'Erreur lors de la modification du partage des statistiques. Veuillez réessayer.',
        })
        return
      }

      router.refresh()

      createToast({
        priority: 'success',
        message: actif ? 'Lien de partage activé' : 'Lien de partage désactivé',
      })
    })

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/statistiques/${lien}`,
      )
      createToast({
        priority: 'success',
        message: 'Lien copié dans le presse-papier.',
      })
      PartageStatistiquesModal.close()
    } catch {
      createToast({
        priority: 'error',
        message: 'Impossible de copier le lien dans le presse-papier.',
      })
    }
  }

  return (
    <div className="fr-my-8v">
      {titre !== null && <h2 className="fr-h6 fr-mb-2v">{titre}</h2>}
      <div className="fr-flex fr-flex-gap-6v fr-align-items-center fr-border fr-border-radius--4 fr-mb-4v fr-px-6v fr-py-4v">
        {partage ? (
          <>
            <div
              className="fr-background-contrast--success fr-p-4v fr-border-radius--8 fr-display-inline-block"
              aria-hidden
            >
              <span className="ri-earth-fill ri-lg fr-line-height-1 fr-text-default--success" />
            </div>
            <div>
              Lien de partage public activé
              <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                Tous les internautes disposant du lien peuvent consulter ces
                statistiques et utiliser les filtres et les exports
              </p>
            </div>
          </>
        ) : (
          <>
            <div
              className="fr-background-contrast--grey fr-p-4v fr-border-radius--8 fr-display-inline-block"
              aria-hidden
            >
              <span className="ri-link-unlink ri-lg fr-line-height-1 fr-text-disabled-grey" />
            </div>
            <div className="fr-flex-1">
              Lien de partage public désactivé
              <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                Ces statistiques ne sont pas consultables par lien
              </p>
            </div>
          </>
        )}
        <ToggleSwitch
          disabled={enCours}
          label={null}
          checked={partage}
          labelPosition="left"
          showCheckedHint={false}
          onChange={basculer}
        />
      </div>
      <Button
        disabled={!partage}
        iconId="fr-icon-link"
        iconPosition="right"
        size="large"
        className="fr-width-full fr-justify-content-center"
        onClick={copier}
      >
        Copier le lien
      </Button>
    </div>
  )
}

export const PartageStatistiques = ({
  liens,
}: {
  liens: readonly LienDuPerimetre[]
}) => {
  const unPartageEstActif = liens.some(({ lien }) => lien !== null)
  const plusieursPerimetres = liens.length > 1

  return (
    <>
      <div className="fr-position-relative">
        <Button
          {...PartageStatistiquesModal.buttonProps}
          title="Partager mes statistiques"
          priority="secondary"
          iconId="fr-icon-link"
        ></Button>
        {unPartageEstActif && (
          <div
            aria-hidden={true}
            className="fr-background-default--grey fr-position-absolute fr-top-0 fr-right-0 fr-icon fr-mr-n2v fr-mt-n2v fr-flex fr-align-items-center fr-border-radius--8"
            style={{ height: '18px' }}
          >
            <span className="ri-checkbox-circle-fill fr-text-default--success" />
          </div>
        )}
      </div>
      <PartageStatistiquesModal.Component title="Partager vos statistiques via un lien">
        {liens.map((lienDuPerimetre) => (
          <LigneDePartage
            key={lienDuPerimetre.perimetre}
            lienDuPerimetre={lienDuPerimetre}
            titre={
              plusieursPerimetres
                ? titreDuPerimetre(lienDuPerimetre.perimetre)
                : null
            }
          />
        ))}
      </PartageStatistiquesModal.Component>
    </>
  )
}
