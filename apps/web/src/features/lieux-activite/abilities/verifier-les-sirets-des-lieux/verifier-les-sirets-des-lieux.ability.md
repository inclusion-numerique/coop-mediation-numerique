# Feature: Vérifier les SIRET des lieux d'activité

Le SIRET d'un lieu vient d'ailleurs — d'un import, d'une saisie, de la
cartographie nationale — et rien ne garantit qu'il désigne l'établissement
qu'on croit. Une passe quotidienne le confronte à l'annuaire des entreprises.

## Rule: Un SIRET qui ne désigne pas le lieu est effacé

> Le SIRET sert de pivot dans le schéma national : un numéro faux se propage à
> tous ceux qui republient le lieu. Un numéro absent, lui, ne dit rien de faux.
> Entre les deux, on préfère l'absence.

### Scenario: Le SIRET désigne bien le lieu

* Given des lieux qui portent un SIRET
* And SIRENE enregistre le premier lieu sous les mêmes nom et adresse
* When on vérifie les SIRET des lieux
* Then le premier lieu garde son SIRET
* And la confrontation du premier lieu est datée

### Scenario: SIRENE enregistre ce SIRET sous un autre nom

* Given des lieux qui portent un SIRET
* And SIRENE enregistre le premier lieu sous un autre nom
* When on vérifie les SIRET des lieux
* Then le SIRET du premier lieu est effacé

### Scenario: SIRENE enregistre ce SIRET à une autre adresse

* Given des lieux qui portent un SIRET
* And SIRENE enregistre le premier lieu à une autre adresse
* When on vérifie les SIRET des lieux
* Then le SIRET du premier lieu est effacé

### Scenario: SIRENE ne connaît pas ce SIRET

* Given des lieux qui portent un SIRET
* And SIRENE ne connaît aucun des SIRET
* When on vérifie les SIRET des lieux
* Then le SIRET du premier lieu est effacé

## Rule: L'identité du lieu ne bouge jamais

> Le lieu s'appelle comme ses médiateurs l'ont nommé, pas comme le répertoire
> des entreprises l'enregistre. La vérification ne fait qu'ôter un numéro.

### Scenario: L'effacement ne touche qu'au SIRET

* Given des lieux qui portent un SIRET
* And SIRENE enregistre le premier lieu sous un autre nom
* When on vérifie les SIRET des lieux
* Then le premier lieu garde son nom et son adresse

## Rule: On ne redemande pas à SIRENE ce qu'on vient de lui demander

> L'annuaire des entreprises bouge lentement et chaque interrogation coûte un
> appel réseau : au-delà de quelques milliers de lieux, une passe qui ne saute
> rien ne tient plus dans sa nuit.

### Scenario: Un lieu confronté récemment est laissé de côté

* Given des lieux qui portent un SIRET
* And le premier lieu a été confronté à SIRENE aujourd’hui
* And SIRENE ne connaît aucun des SIRET
* When on vérifie les SIRET des lieux
* Then le premier lieu garde son SIRET
* And SIRENE n’a pas été interrogée sur le premier lieu

## Rule: Un lieu qui échoue n'emporte pas les autres

> La passe traverse toute la table. Une panne sur une ligne doit coûter cette
> ligne, pas la nuit entière.

### Scenario: L'annuaire tombe en panne sur un lieu

* Given des lieux qui portent un SIRET
* And SIRENE tombe en panne sur le premier lieu
* And SIRENE ne connaît pas le SIRET du second lieu
* When on vérifie les SIRET des lieux
* Then le premier lieu garde son SIRET
* And le SIRET du second lieu est effacé
* And la passe compte un échec
