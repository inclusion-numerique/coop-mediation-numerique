# Fonctionnalité: Relancer les inscrits inactifs

> Un compte inscrit qui n'a encore rien produit est relancé à J+7, J+30 et
> J+60 après son inscription, averti à J+90, puis supprimé à J+105 comme
> par l'administration. Produire quoi que ce soit — une activité, un
> bénéficiaire, une équipe — arrête les relances.

## Règle: L'inscrit est relancé selon son ancienneté

### Scénario: Un inscrit depuis 40 jours reçoit la relance de J+30

* Étant donné un inscrit depuis 40 jours, relance "-"
* Quand les inscrits inactifs sont relancés
* Alors cet inscrit reçoit la relance de J+30
* Et sa relance d'inscrit enregistrée est "nouveau_j30_sent"

### Scénario: Une relance restée de l'inscription n'empêche pas la suite

> La validation de l'inscription ne remettait pas le compteur à zéro : ces
> comptes n'étaient plus jamais relancés.

* Étant donné un inscrit depuis 8 jours, relance "reminder_j30_sent"
* Quand les inscrits inactifs sont relancés
* Alors cet inscrit reçoit la relance de J+7

### Scénario: Un inscrit averti est supprimé à J+105

* Étant donné un inscrit depuis 106 jours, relance "warning_j90_sent"
* Quand les inscrits inactifs sont relancés
* Alors cet inscrit est supprimé

## Règle: Créer un bénéficiaire compte comme une activité

### Scénario: Un inscrit qui suit un bénéficiaire n'est plus relancé

* Étant donné un inscrit depuis 106 jours, relance "warning_j90_sent", avec un bénéficiaire
* Quand les inscrits inactifs sont relancés
* Alors cet inscrit ne reçoit rien

## Règle: Seule la production non supprimée protège le compte

### Scénario: Une activité créée puis supprimée ne protège plus l'inscrit

* Étant donné un inscrit depuis 106 jours, relance "warning_j90_sent", avec une activité supprimée
* Quand les inscrits inactifs sont relancés
* Alors cet inscrit est supprimé
