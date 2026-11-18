# Décisions d'architecture

Ce dossier consigne les décisions d'architecture (ADR) du dépôt, au format [MADR](https://adr.github.io/madr/).

## Rédiger un ADR

Copier [`adr-template.md`](./adr-template.md) en `NNNN-titre-en-kebab-case.md`, avec le numéro suivant le dernier ADR sur quatre chiffres, puis remplacer chaque consigne par le contenu. Les titres des sections et les valeurs de statut sont ceux de MADR, en anglais, pour que l'outil de vérification les reconnaisse ; le contenu est en français. Les sections marquées facultatives se suppriment quand elles ne servent pas.

`pnpm lint:adr` vérifie le format avec [mdbook-lint](https://github.com/joshrotenberg/mdbook-lint) et ses règles MADR : en-tête, statut, date, sections obligatoires, options envisagées, numérotation et liens entre ADR. La CI le lance à chaque PR. La règle qui impose des conséquences en « Good, because… » / « Bad, because… » reste désactivée.

## Règles de rédaction

- **Living documentation** : l'ADR pose les décisions et leurs raisons, de façon générique. Le détail qui peut dériver vit dans les abilities (`*.ability.md`), spécifications exécutables qui font foi ; l'ADR y renvoie. Aucun nom de fonction, de fichier ou de ligne de code, aucun chemin dans le texte : seuls les liens de « More Information » pointent vers le dépôt.
- **Pas de journal** : aucune mise à jour datée dans le corps. L'historique git porte le détail ; le tableau d'historique ne garde que les rédactions et les révisions de l'ADR, et l'en-tête porte la date de la dernière.
- **Renvois vers le passé seulement** : un ADR ne référence que des ADR de numéro inférieur, jamais un ADR postérieur. Il pose une situation à un instant donné ; c'est le nouvel ADR qui cite l'ancien qu'il complète ou remplace.
- **Vocabulaire** : « Dataspace » désigne la plateforme, « main » désigne uniquement le schéma de base de données.
- **Pas d'état transitoire** : ne pas décrire les étapes intermédiaires d'une migration. Une décision dont la cible n'est pas atteinte décrit l'état actuel puis s'écrit « Cible à atteindre, ticket à ouvrir ».
- **Pas de chiffres qui dérivent** : pas de compte de fichiers, de lignes ou d'occurrences, sauf les chiffres qui ont fondé la décision.
- **Pas de point médian** : reformuler en tournure neutre (« les personnes concernées »).
