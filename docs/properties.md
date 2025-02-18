---
layout: merlot_custom
---

# Properties available to change

Some properties of the game are publicly available and can be set at various points throughout the entities specification files. Often in the form of list entries with the property name and value in a short array like this:

```yaml
property-spec:
  - ["name", "value"]
```

## List of all properties

The following list is updated regularly to reflect the latest state of the game engine. Their entries are categorized and alphabetically sorted with each having this format:

| property name     | possible values    | default value  |
|:------------------|:-------------------|:---------------|
| **example-name**  | `value1`, `value2` | `value1`       |

* _Brief description of the property's effect._

### Level properties

|:-|:-|:-|
| **map-tiles** | `true`, `false` | `false` |

* _Revealed tiles stay visible on map._

|:-|:-|:-|
| **reveal-tiles** | `true`, `false` | `false` |

* _All tiles are revealed on map._

|:-|:-|:-|
| **vision-distance** | distance in tiles | `1` |

* _Radius around player where tiles are revealed._

* * *

[Back to home page...](index)
