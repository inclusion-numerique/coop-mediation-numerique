# Fonctionnalité: Exporter les utilisateurs

> L'administration télécharge la liste qu'elle a sous les yeux : mêmes mots
> cherchés, mêmes filtres.

## Règle: L'export reprend la recherche et les filtres de la liste

### Scénario: Seuls les comptes trouvés sont exportés

* Étant donné deux médiateurs actifs et un médiateur supprimé à exporter
* Quand l'administration exporte les comptes actifs de cette recherche
* Alors le classeur exporté compte 2 utilisateurs
* Et le classeur rappelle le filtre de statut "Actif"
