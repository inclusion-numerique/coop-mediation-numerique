# Feature: Consulter une employeuse

Fiche d'administration : l'identité légale d'une employeuse, son référent, et
qui elle emploie aujourd'hui.

## Rule: La fiche donne l'identité et les personnes employées

### Scenario: Une employeuse qui emploie deux personnes

* Given l'employeuse "Zzz Consultee" existe avec 2 personnes rattachées
* When je consulte la fiche de "Zzz Consultee"
* Then la fiche porte le nom "Zzz Consultee"
* And la fiche compte 2 personnes employées

### Scenario: Une employeuse sans personne rattachée

* Given l'employeuse "Zzz Vide" existe sans personne rattachée
* When je consulte la fiche de "Zzz Vide"
* Then la fiche compte 0 personne employée

### Scenario: Une personne rattachée par plusieurs sources ne compte qu'une fois

Une même personne porte une affectation active PAR source (`coop`, `idposte`,
`aidants-connect`). La fiche répond « qui cette employeuse emploie-t-elle », pas
« combien d'affectations existent ».

* Given l'employeuse "Zzz Multisource" existe avec 1 personne rattachée par 3 sources
* When je consulte la fiche de "Zzz Multisource"
* Then la fiche compte 1 personne employée

## Rule: Seuls les rattachements actifs comptent

### Scenario: Un rattachement terminé ne figure plus

* Given l'employeuse "Zzz Passee" existe avec 1 personne rattachée
* And le rattachement à "Zzz Passee" est terminé
* When je consulte la fiche de "Zzz Passee"
* Then la fiche compte 0 personne employée

## Rule: Une employeuse supprimée ne se consulte plus

### Scenario: Une employeuse supprimée côté Entrepôt

* Given l'employeuse "Zzz Supprimee" existe sans personne rattachée
* And l'employeuse "Zzz Supprimee" a été supprimée
* When je consulte la fiche de "Zzz Supprimee"
* Then aucune fiche n'est trouvée
