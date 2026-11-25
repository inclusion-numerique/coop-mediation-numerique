# Fonctionnalité: Compter les accompagnements par commune

> La commune où ont eu lieu les accompagnements : celle du lieu d'activité,
> sinon celle saisie pour l'activité. La plus fréquente en premier.

## Règle: La commune du lieu prime sur celle saisie pour l'activité

### Scénario: Des accompagnements au lieu, à domicile et à distance

* Étant donné la médiatrice "Ada Lovelace"
* Et les activités de "Ada Lovelace" :
  | date       | type       | anonymes | lieu          | typeLieu  | communeDuLieu     |
  | 2026-03-03 | collectif  | 3        | Espace Lumière |           |                   |
  | 2026-03-05 | individuel | 1        |               | Domicile  | Thuir 66300 66210 |
  | 2026-03-07 | individuel | 1        |               | ADistance |                   |
* Quand je compte les accompagnements de "Ada Lovelace" par commune
* Alors les communes comptées sont "Lyon · 69001 3, Thuir · 66300 1, Non communiquée 1"
