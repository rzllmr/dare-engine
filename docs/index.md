---
layout: merlot_custom
---

> If you want to make a game, just dare to do it now!

This is about a little game engine capable of running small 2D top-down RPGs in the browser and on mobile. So that everybody you want to show the game to could try it on the device they're already familiar with. Intuitive to control, easy to grasp. Nothing in between them and your own hand-crafted adventure.

Besides maybe the pixel art style some folks really don't like. 🥲

So, before you start with anything you might want to see yourself what your game could be like in the template I made over at [itch.io](https://rzllmr.itch.io/dare). If that's something you want to make yourself, you're at the right place and should read on.

# How can I make a game?

...you might ask. And "all with your handy text editor" I reply.

There are no special editor tools you have to learn. One for the levels, one for dialogs, one for music and more for the rest. You just need a text editor - preferably understanding different text file formats like _.yml_ and _.ink_. So Word wouldn't work, but [VSCode](https://code.visualstudio.com/) I can warmly recommend. Grab its [YAML](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) and [ink](https://marketplace.visualstudio.com/items?itemName=bruno-dias.ink) extensions and you are good to go.

Download the example from the top of the page, unzip it, and let us dive right in.

## How to run the template?

At first you might want to start the game to see what we're dealing with here. Just ensure you have [Node.js](https://nodejs.org) installed and execute the _run.bat_ on Windows or _run.command_ on Mac/Linux in the unpacked directory. This will serve the game to your favorite browser, so you can access it at [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

But we need a few more clicks to show the mobile version as the desktop variant isn't supported yet, sorry... 😅 It's a little different for each browser, but you need to look for the **Responsive Design Mode** usually also available with the shortcut Ctrl+Shift+M on Windows/Linux and Option+Command+M on Mac. When you found it and see a smaller portrait view now, reload the page and the game should finally start.

Go on now, explore the game and try everything out! It gives you a glimpse of what you could create yourself in just a moment. As soon as you're ready for that, follow me to the next section where we peek behind the curtain. 

## What are all these files?

**Most of it you wouldn't need to touch ever.** You could if you're adventurous or an eager programmer, of course. But do not let it distract you from your actual task of making a game. If you really want it though you better start [here](https://github.com/rzllmr/pixi-engine).

The only thing we're interested in now is the _content/_ folder. Because we want to make content for the game. And that is structured like this:

📂 _dialogs/_ containing all our _.ink_ files with the many dialog lines

📂 _entities/_ having _.yaml_ files of all the things that exist in our game and their properties

📂 _levels/_ with neat representations of the game's levels in kind of ASCII art

You can just go now and fiddle around with all the files as you like and see what it does. But if you stay I explain how all that really works in detail.


## Creating levels

Let us open the _levels/demo.yml_ file and take a look how the demo level is made.

```yaml
layout: |

  ^   # # # #
  # # # . . # # # # # # # # # #
  # @ . □ . * . . . . . . . . #
  # . □ □ . # . . . . . . T . #
  # # . . . # μ . . . . . . . #
    # κ . # # . . . . . . . . #
    # # # # # # # # # # # # # #

key:
  "@": player
  " ": none
  ".": floor
  "#": wall
  "+": door
  "*": door (key?)
  "κ": mysterious chest (key)
  "□": crate
  "μ": map
  "T": sign
```

It is composed of two sections: the **layout** defining where and the **key** describing what everything is.

### About the layout

The layout is a map of the level with characters representing different entities. What character means what you can define in the key, but there a few rules to ensure the map will work properly in the game:

**Have any character in the upper left corner** of your map, because that defines the starting point of the map data for our clueless yaml parser. You can use any character besides whitespace, whether it is used or not. So if your level has something lingering in the upper left corner anyway, you already pass this requirement.

**Separate all characters with one whitespace** to make the map appear more in the dimensions of the game and leave space for a little extra. Because later you can replace that whitespace you left with a special character to bind events to, that are triggered when moved to. But more on that in the key section.

### About the key

In the key you can specify what each character stands for and add some extra info for entities that support it. The only rules are as follows:

**Every unicode character is allowed** as long as it's quoted, while the text afterwards doesn't need quotations. That makes enough characters available to even introduce your own conventions. I for example use small greek letters for items.

**You have to associate existing entities** with the characters. Those have to be defined with all their properties in one of the _entities/_ files. But more about that in the next section.

**The extras in parentheses depend on the elment** they are appended to. A chest for example has its content specified in a comma-list. And its required items marked with a question mark (key?) in that same list.


## Defining entities

There are many options in defining entities, because this is where the game logic lies. So, let's look at a few examples:

```yaml
chest:
  sprite: "chest"
  info: "A simple chest."
  open:
    need: "*?"
  pick:
    item: "*"

mysterious chest:
  like: "chest"
  info: "A mysterious chest with unknown content."

map:
  sprite: "map"
  info: "A detailed map of the vicinity."
  pick: 
    take:
      - ["reveal-tiles", true]
```

You see it's trees of nested properties we want to go through now bit by bit. The file format ([yml](https://yaml.org/spec/1.2.2/)) is the same as with the levels, but we make more use of it here. For example by creating lists that have their items begin with "- ". But let's start from the top to describe the scheme:

**The root is the entity's name** that has to be unique among all files used for a level. For bigger levels a naming scheme might be a good idea, but that's up to you. Just use quotes for outlandish characters beyond the alphanumeric and you can name it however you want.

**With "like" you can reference another** entity or multiple you want to copy the properties from. If it is a list of entities the properties of the latter have priority over the former, with the current one alwyas being last. In good use this can save you a lot of redundancy.

**The rest is components** in all their variety. Every branch at the first level (besides "like") is a component of its own, that can be used to enhance the entity with a feature or ability. In fact an entity is not much more than its components, so let's take a look what they offer.

### About the components

The following list of components is only what is available now, but will be expanded further step by step. Some of them may take longer, because they involve a whole new game system, but I will keep you posted. Until then please go ahead, stick together what you want and explore everything you can already create with them.

📋 **info** is the description you get of an entity in the game

💼 **inventory** attaches an item container to the entity

🏃 **move** can allow another entity to move past

🔓 **open** an entity to get through or access its content

🧺 **pick** up an entity to add it to inventory or equipment

🐏 **push** an entity around in the world to clear or block

🖼️ **sprite** is the representation of the entity in the world

💬 **tell** something in a dialog window when triggered

## Writing dialogs

As before let's begin with an example:

```ink
=== enter ===
You find yourself in a dim place, crammed with crates.
Time to get out...
-> DONE

=== call ===
Do you have it? #speaker: stranger
The rat I mean...
You just have to catch it!
-> DONE
```

Writing dialogs with possible branches and conditions is a topic on its own. And therefore I decided to leave that to a format developed by people proficient in it: [ink](https://www.inklestudios.com/ink/) by game studio [inkle](https://www.inklestudios.com/). There is a whole [manual](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md) with all its details, but even the basics will get you pretty far. Just keep the following rules in mind:

**Start separate dialogs with a unique title** in the `=== title ===` format you've seen above. This way it can easily be referenced by other files triggering it whenever you want. And don't worry, you don't need to be overly creative as the title only needs to be unique to the file it is in.

**End a dialog or route to the next**, either with `-> DONE` or the title of the next dialog part in the same format. But only if you want to use the parts in different combinations. Otherwise it's always better to have it as one block one can read through instead of trying to follow it jumping around through the file.

**Annotate a line with a speaker when they're changing** in the `#speaker: name` format shown above. That tells the in-game dialog to highlight the new speaker, so everybody can follow who's currently talking. It also helps to not get it mixed up yourself later.

**Each line is a new dialog window** switched to when the player continues. That way you can control the pacing of the text yourself. A very important ingredient to the general pacing of the scene itself.


## Closing words

Now that you come thus far you should definitly stop reading and start making. Try it out, experiment with everything and look what it does, and first and foremost have fun doing it! 😊

In case you can't because of some pesky bugs, please [report](https://github.com/rzllmr/dare-engine/issues/new?template=Blank+issue) them and I'll take care as soon as I can.

<br>

* * *

## What comes next

There is always so much more planned and this is just an excerpt:

- [ ] Change the level through portals
- [ ] Make more use of the book
- [ ] Extend dialogs with multiple choice
- [ ] Let other creatures move around

## Releases so far

{% for post in site.posts %}
### [{{ post.title }}](.{{ post.url }})
{{ post.excerpt }}
{% endfor %}
