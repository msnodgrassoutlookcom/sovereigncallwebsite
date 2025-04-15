import type { Planet } from "./types"

export const planets: Planet[] = [
  {
    id: "lyr",
    name: "Lyr",
    description:
      "The Throneworld, seat of the Silent King and capital of the Dominion. Its grand architecture and military presence reflect the Dominion's commitment to order and tradition. The central palace district houses ancient artifacts and technology from before the King's silence.",
    faction: "dominion",
    position: { x: 0.1, y: 0.1 },
    size: 12,
    color: "#ffa500",
    importance: "capital",
  },
  {
    id: "celaris",
    name: "Celaris",
    description:
      "Home to the Remnant Temple, housing relics of the King's speech. Once a place of pilgrimage, now heavily guarded by Dominion forces. The temple's inner sanctum is said to contain the last recorded words of the King before his silence.",
    faction: "dominion",
    position: { x: 0.2, y: 0.3 },
    size: 8,
    color: "#ff8c00",
    importance: "major",
  },
  {
    id: "nova-prime",
    name: "Nova Prime",
    description:
      "The technological heart of the Reformation. Its orbital neural grid connects millions of citizens in a vast information network. The planet's surface is covered in gleaming spires and research facilities dedicated to advancing technology beyond the King's ancient protocols.",
    faction: "reformation",
    position: { x: 0.8, y: 0.7 },
    size: 10,
    color: "#4169e1",
    importance: "capital",
  },
  {
    id: "euron",
    name: "Euron",
    description:
      "A former Reformation stronghold devastated by Dominion forces. Beneath its scorched surface lie ancient secrets that both factions seek. Mercenary groups and scavengers brave the dangerous conditions to recover valuable artifacts and technology.",
    faction: "contested",
    position: { x: 0.5, y: 0.6 },
    size: 7,
    color: "#800080",
    importance: "major",
  },
  {
    id: "meridian",
    name: "Meridian",
    description:
      "A neutral trading hub where factions meet in uneasy peace. Its markets offer rare technologies and information for those with the credits to pay. The planet's neutrality is protected by an ancient treaty that even the warring factions dare not violate.",
    faction: "neutral",
    position: { x: 0.4, y: 0.2 },
    size: 6,
    color: "#32cd32",
    importance: "major",
  },
  {
    id: "helios",
    name: "Helios",
    description:
      "A Dominion military fortress world, home to the Phoenix Guard training facilities and orbital defense platforms. The planet's atmosphere is perpetually clouded by industrial output from weapons manufacturing facilities that cover much of the surface.",
    faction: "dominion",
    position: { x: 0.3, y: 0.4 },
    size: 7,
    color: "#ff4500",
    importance: "major",
  },
  {
    id: "nexus",
    name: "Nexus",
    description:
      "The Reformation's research and development center, where experimental technologies are created and tested. The planet is surrounded by a network of artificial satellites that form a protective shield and serve as testing grounds for new innovations.",
    faction: "reformation",
    position: { x: 0.7, y: 0.5 },
    size: 8,
    color: "#1e90ff",
    importance: "major",
  },
  {
    id: "shadow-reach",
    name: "Shadow Reach",
    description:
      "A mysterious region where Eclipse ruins have been discovered. Both factions maintain research outposts here, studying the ancient technology. Strange energy readings and unexplained phenomena make this one of the most dangerous yet potentially valuable regions in the galaxy.",
    faction: "contested",
    position: { x: 0.6, y: 0.8 },
    size: 9,
    color: "#9932cc",
    importance: "major",
  },
  {
    id: "asteria",
    name: "Asteria",
    description:
      "A gas giant with floating cities harvesting rare elements from the atmosphere. Its position makes it strategically valuable to both factions, resulting in frequent skirmishes in the upper atmosphere.",
    faction: "contested",
    position: { x: 0.35, y: 0.65 },
    size: 8,
    color: "#9370db",
    importance: "major",
  },
  {
    id: "cygnus",
    name: "Cygnus",
    description:
      "An ice world on the fringes of Dominion space. Its deep caverns house ancient data vaults that the Dominion guards zealously, believing they contain the King's contingency protocols.",
    faction: "dominion",
    position: { x: 0.15, y: 0.5 },
    size: 6,
    color: "#ff6347",
    importance: "minor",
  },
  {
    id: "vega",
    name: "Vega",
    description:
      "A Reformation colony known for its advanced education systems and neural enhancement facilities. Citizens undergo voluntary neural integration to join the collective consciousness that guides Reformation policy.",
    faction: "reformation",
    position: { x: 0.85, y: 0.4 },
    size: 7,
    color: "#4682b4",
    importance: "minor",
  },
]
