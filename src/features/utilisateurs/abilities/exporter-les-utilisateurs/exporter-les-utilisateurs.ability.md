# Feature: Exporter les utilisateurs

> L'administration télécharge la liste qu'elle a sous les yeux : mêmes mots
> cherchés, mêmes filtres.

## Rule: L'export reprend la recherche et les filtres de la liste

### Scenario: Seuls les comptes trouvés sont exportés

* Given deux médiateurs actifs et un médiateur supprimé à exporter
* When l'administration exporte les comptes actifs de cette recherche
* Then le classeur exporté compte 2 utilisateurs
* And le classeur rappelle le filtre de statut "Actif"
