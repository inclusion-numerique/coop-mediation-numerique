import Notice from '@codegouvfr/react-dsfr/Notice'

export const BanniereDeMaintenance = ({ message }: { message: string }) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
    <Notice
      isClosable={false}
      className="fr-notice--alert fr-notice--flex fr-align-items-center"
      title={<span style={{ whiteSpace: 'pre-line' }}>{message}</span>}
    />
  </div>
)
