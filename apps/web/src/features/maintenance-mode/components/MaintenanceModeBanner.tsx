import { getMaintenanceMode } from '@app/web/features/maintenance-mode/db/getMaintenanceMode'
import Notice from '@codegouvfr/react-dsfr/Notice'

export const MaintenanceModeBanner = async () => {
  const { active, message } = await getMaintenanceMode()

  if (!active) {
    return null
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <Notice
        isClosable={false}
        className="fr-notice--alert fr-notice--flex fr-align-items-center"
        title={<span style={{ whiteSpace: 'pre-line' }}>{message}</span>}
      />
    </div>
  )
}
