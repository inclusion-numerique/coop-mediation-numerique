# Fonctionnalité: Consulter une employeuse

Fiche d'administration : l'identité légale d'une employeuse, son référent, et
qui elle emploie aujourd'hui.

## Règle: La fiche donne l'identité et les personnes employées

### Scénario: Une employeuse qui emploie deux personnes

* Étant donné l'employeuse "Zzz Consultee" existe avec 2 personnes rattachées
* Quand je consulte la fiche de "Zzz Consultee"
* Alors la fiche porte le nom "Zzz Consultee"
* Et la fiche compte 2 personnes employées

### Scénario: Une employeuse sans personne rattachée

* Étant donné l'employeuse "Zzz Vide" existe sans personne rattachée
* Quand je consulte la fiche de "Zzz Vide"
* Alors la fiche compte 0 personne employée

### Scénario: Une personne rattachée par plusieurs sources ne compte qu'une fois

Une même personne porte une affectation active PAR source (`coop`, `idposte`,
`aidants-connect`). La fiche répond « qui cette employeuse emploie-t-elle », pas
« combien d'affectations existent ».

* Étant donné l'employeuse "Zzz Multisource" existe avec 1 personne rattachée par 3 sources
* Quand je consulte la fiche de "Zzz Multisource"
* Alors la fiche compte 1 personne employée

## Règle: Seuls les rattachements actifs comptent

### Scénario: Un rattachement terminé ne figure plus

* Étant donné l'employeuse "Zzz Passee" existe avec 1 personne rattachée
* Et le rattachement à "Zzz Passee" est terminé
* Quand je consulte la fiche de "Zzz Passee"
* Alors la fiche compte 0 personne employée

## Règle: Une employeuse supprimée ne se consulte plus

### Scénario: Une employeuse supprimée côté Entrepôt

* Étant donné l'employeuse "Zzz Supprimee" existe sans personne rattachée
* Et l'employeuse "Zzz Supprimee" a été supprimée
* Quand je consulte la fiche de "Zzz Supprimee"
* Alors aucune fiche n'est trouvée
