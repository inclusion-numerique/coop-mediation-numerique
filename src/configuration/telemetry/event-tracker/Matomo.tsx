import Script from 'next/script'
import { environnementClient } from '@/configuration/environnement'
import { estMain } from '@/configuration/projet'

// The Next <Script> tag expect a nonce as Next directly inject the code from the script file in an inline <script> tag
export const Matomo = ({ nonce }: { nonce?: string }) =>
  estMain &&
  environnementClient.NODE_ENV === 'production' &&
  environnementClient.NEXT_PUBLIC_MATOMO_HOST ? (
    <Script
      id="matomo"
      nonce={nonce}
      strategy="lazyOnload"
    >{`var _paq = window._paq = window._paq || [];_paq.push(['trackPageView']);_paq.push(['enableLinkTracking']);(function() {var u="//${environnementClient.NEXT_PUBLIC_MATOMO_HOST}/";_paq.push(['setTrackerUrl', u+'matomo.php']);_paq.push(['setSiteId', '${environnementClient.NEXT_PUBLIC_MATOMO_SITE_ID ?? ''}']);var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);})();`}</Script>
  ) : null
