# Fonctionnalité: Administrer les comptes RDV Service Public

> L'administration suit les comptes RDV Service Public reliés à la coop : combien
> de rendez-vous chacun a remontés, et le détail de leurs synchronisations.

## Règle: L'administration liste les comptes reliés avec leurs rendez-vous

### Scénario: Un compte relié est listé avec le nombre de ses rendez-vous

* Étant donné un compte RDV relié qui a remonté 2 rendez-vous
* Quand l'administration liste les comptes RDV
* Alors ce compte est listé avec 2 rendez-vous

## Règle: Le détail n'existe que pour un utilisateur relié à RDV Service Public

### Scénario: Le détail d'un compte relié est consultable

* Étant donné un compte RDV relié qui a remonté 2 rendez-vous
* Quand l'administration consulte le détail de ce compte
* Alors le détail de ce compte est affiché

### Scénario: Un utilisateur sans compte RDV n'a pas de détail

* Quand l'administration consulte le détail d'un utilisateur sans compte RDV
* Alors aucun détail n'est affiché
