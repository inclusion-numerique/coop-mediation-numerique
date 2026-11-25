import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display'
import { FooterBottomItem } from '@codegouvfr/react-dsfr/Footer'
import { publicFooterProps } from '@/features/navigation/ui/slots/PublicFooter.slot'

const MinimalFooter = () => {
  return (
    <footer
      role="contentinfo"
      id="fr-footer"
      className="fr-footer__bottom fr-px-8v fr-no-print fr-mt-0"
    >
      <ul className="fr-footer__bottom-list">
        {...publicFooterProps.bottomItems.map((bottomItem, index) => (
          <li className="fr-footer__bottom-item" key={index}>
            {'text' in bottomItem ? (
              <FooterBottomItem bottomItem={bottomItem} />
            ) : (
              bottomItem
            )}
          </li>
        ))}
        <li className="fr-footer__bottom-item">
          <FooterBottomItem bottomItem={headerFooterDisplayItem} />
        </li>
      </ul>
    </footer>
  )
}

export default MinimalFooter
