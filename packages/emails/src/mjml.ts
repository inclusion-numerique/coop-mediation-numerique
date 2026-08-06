import type { Options } from 'html-minifier'
import { minify } from 'html-minifier'
import mjml2html from 'mjml'

const MINIFIER_OPTIONS: Options = {
  collapseWhitespace: true,
  conservativeCollapse: false,
  minifyJS: false,
}

// mjml 5 rend `mjml2html` asynchrone : la compilation traverse désormais une chaîne de
// plugins qui peut faire des entrées-sorties. La fonction suit, et ses appelants — tous déjà
// asynchrones puisqu'ils envoient un courriel — n'ont qu'un `await` à ajouter.
export async function compileMjml(mjmlTemplate: string): Promise<string> {
  const result = await mjml2html(mjmlTemplate, { validationLevel: 'strict' })
  if (result.errors.length > 0) {
    throw new Error(
      `Could not compile template ${result.errors
        .map((error) => error.formattedMessage)
        .join(', ')}`,
    )
  }
  return minify(result.html, MINIFIER_OPTIONS)
}
