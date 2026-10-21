# Feature: Relancer les inscrits inactifs

> Un compte inscrit qui n'a encore rien produit est relancé à J+7, J+30 et
> J+60 après son inscription, averti à J+90, puis supprimé à J+105 comme
> par l'administration. Produire quoi que ce soit — une activité, un
> bénéficiaire, une équipe — arrête les relances.

## Rule: L'inscrit est relancé selon son ancienneté

### Scenario: Un inscrit depuis 40 jours reçoit la relance de J+30

* Given un inscrit depuis 40 jours, relance "-"
* When les inscrits inactifs sont relancés
* Then cet inscrit reçoit la relance de J+30
* And sa relance d'inscrit enregistrée est "nouveau_j30_sent"

### Scenario: Une relance restée de l'inscription n'empêche pas la suite

> La validation de l'inscription ne remettait pas le compteur à zéro : ces
> comptes n'étaient plus jamais relancés.

* Given un inscrit depuis 8 jours, relance "reminder_j30_sent"
* When les inscrits inactifs sont relancés
* Then cet inscrit reçoit la relance de J+7

### Scenario: Un inscrit averti est supprimé à J+105

* Given un inscrit depuis 106 jours, relance "warning_j90_sent"
* When les inscrits inactifs sont relancés
* Then cet inscrit est supprimé

## Rule: Créer un bénéficiaire compte comme une activité

### Scenario: Un inscrit qui suit un bénéficiaire n'est plus relancé

* Given un inscrit depuis 106 jours, relance "warning_j90_sent", avec un bénéficiaire
* When les inscrits inactifs sont relancés
* Then cet inscrit ne reçoit rien
