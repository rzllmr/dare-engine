---
layout: merlot_custom
---

# All components and their specs

Here you find a list of all the available components and their specifications. It will updated regularly whenever there are additions or changes. Each entry has the following parts:

**A brief description** of the purpose of the component and what it does when part of an entity.

**The full yaml structure** with all specs available for that component. The values given are the defaults they take on when not specified differently. And the commented values tell you what spec a value is used for that is given directly to the component key.

**A listing of the available specs**, their possible values, default value and purpose.

## Info

The info component gives the entity a description that is used in multiple contexts.

```yaml
entity:
  info: # text
    text: ""
```

| specification | possible values | default value |
|:-|:-|:-|
| **text** | arbitrary string | empty string |

* _Brief description of the entity._

## Inventory

The inventory component attaches an item container to an entity. It allows it to pick up and equip other entities.

```yaml
entity:
  inventory: ~
```

## Light

The light component illuminates the tiles surrounding the entity.

```yaml
entity:
  light: # radius
    radius: 1
```

| specification | possible values | default value |
|:-|:-|:-|
| **radius** | positive integer | `1` |

* _Radius of tiles to light in a circle around the entity._

## Move (default)

The move component of an entity defines whether or not another entity can get past it.

```yaml
entity:
  move: # pass
    pass: false
```

| specification | possible values | default value |
|:-|:-|:-|
| **pass** | `true`, `false` | `false` |

* Whether another entity can move past.

## Open

The open component allows an entity to be opened.

```yaml
entity:
  open: # pass
    need: []
    pass: false
```

| specification | possible values | default value |
|:-|:-|:-|
| **need** | entity list | empty list |

* _Entities to have in inventory to open this._

|:-|:-|:-|
| **pass** | `true`, `false` | `false` |

* _Whether this entity can be passed when open._

## Port

The port component moves the entity to a point in another level.

```yaml
entity:
  port: # where
    where: ""
```

| specification | possible values | default value |
|:-|:-|:-|
| **where** | `level.entity` format | empty string |

* _The level and entity to port this to._
  
## Pick

The pick component allows an entity to be picked up and equipped.

```yaml
entity:
  pick:
    equip: []
    # - ["property-key", "value"]
    take: []
    # - ["property-key", "value"]
    where: "back"
```

| specification | possible values | default value |
|:-|:-|:-|
| **equip** | property list | empty list |

* [Property values](properties) to change when this entity is equipped.

| **take** | property list | empty list |

* [Property values](properties) to change when this entity is picked up.

| **where** | `back`, `body`, `hand`, `head`, `feet` | `back` |

* What body part this entity occupies when equipped.

## Push

The push component makes an entity being pushed back on interaction.

```yaml
entity:
  push: ~
```

## Sprite (default)

The sprite component defines the representation of an entity in the game world.

```yaml
entity:
  sprite: # idle
    block: false
    ground: false
    idle: "empty"
    variants:
      align: ""
      openable: false
      random: false
```

| specification | possible values | default value |
|:-|:-|:-|
| **block** | `true`, `false` | `false` |

* Whether this entity blocks view.

| **ground** | `true`, `false` | `false` |

* Whether this entity is part of the ground layer.

| **idle** | sprite name | "empty" |

* Name of the sprite-sheet part to be used.

| variants/**align** | entity name | empty string |

* Entity to align the sprite to when adjacent.

| variants/**openable** | `true`, `false` | `false` |

* Use different sprite for opened/closed state.

| variants/**random** | `true`, `false` | `false` |

* Randomize the sprite with descending probability.

## Tell

The tell component starts a dialog on interaction with the entity.

```yaml
entity:
  tell: # text
    text: ""
```

| specification | possible values | default value |
|:-|:-|:-|
| **text** | arbitrary string | empty string |

* Line(s) to tell in a dialog window.

* * *

[Back to home page...](index)
