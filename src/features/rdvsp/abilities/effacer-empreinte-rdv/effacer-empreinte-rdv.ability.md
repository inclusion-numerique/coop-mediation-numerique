# Fonctionnalité: Effacer l'empreinte RDV Service Public d'un compte

## Règle: Les rendez-vous partent avec le compte agent

> Ils ne peuvent pas rester : la base interdit de supprimer un compte agent dont
> des rendez-vous dépendent. Et les conserver garderait leurs participations,
> donc aucun usager ne serait jamais orphelin — l'effacement se viderait de sa
> substance. Les comptes rendus qui référençaient ces rendez-vous survivent, la
> base mettant leur lien à nul d'elle-même.

### Scénario: Le compte agent et ses rendez-vous sont effacés

* Étant donné un compte RDV avec un rendez-vous et un usager
* Quand j'efface l'empreinte RDV de ce compte
* Alors le compte RDV est délié
* Et l'effacement RDV porte sur 1 rendez-vous
* Et le compte RDV n'est plus en base
* Et le rendez-vous n'est plus en base

## Règle: Les jetons OAuth sont révoqués chez RDV Service Public

> Effacer les jetons de notre base ne suffit pas : ils resteraient valides chez
> RDV Service Public jusqu'à leur expiration. Une révocation impossible ne doit
> pas pour autant bloquer la suppression du compte, qui ne dépend pas d'un
> service externe : l'échec est signalé et l'effacement continue.

### Scénario: Les jetons sont révoqués avant l'effacement

* Étant donné un compte RDV connecté avec un rendez-vous et un usager
* Quand j'efface l'empreinte RDV de ce compte
* Alors les jetons RDV sont révoqués
* Et le compte RDV n'est plus en base

### Scénario: Une révocation impossible n'empêche pas l'effacement

* Étant donné un compte RDV connecté avec un rendez-vous et un usager
* Et RDV Service Public est indisponible
* Quand j'efface l'empreinte RDV de ce compte
* Alors les jetons RDV ne sont pas révoqués
* Et le compte RDV n'est plus en base
* Et le rendez-vous n'est plus en base

## Règle: Un usager n'est supprimé que s'il ne sert plus à personne

> 565 usagers servent de deux à quatre médiateurs. Supprimer parce qu'un seul
> s'en va dépouillerait ses collègues.

### Scénario: Un usager que plus rien ne rattache est supprimé

* Étant donné un compte RDV avec un rendez-vous et un usager
* Quand j'efface l'empreinte RDV de ce compte
* Alors l'effacement RDV supprime 1 usager

### Scénario: Un usager encore rattaché à un bénéficiaire est conservé

* Étant donné un compte RDV avec un rendez-vous et un usager
* Et cet usager est rattaché au bénéficiaire d'un autre médiateur
* Quand j'efface l'empreinte RDV de ce compte
* Alors l'effacement RDV supprime 0 usager
* Et l'usager RDV est toujours en base

## Règle: Rejouer l'effacement ne fait rien de plus

### Scénario: Un second effacement ne trouve plus de compte

* Étant donné un compte RDV avec un rendez-vous et un usager
* Quand j'efface l'empreinte RDV de ce compte
* Et j'efface à nouveau l'empreinte RDV de ce compte
* Alors le compte RDV n'est pas délié
