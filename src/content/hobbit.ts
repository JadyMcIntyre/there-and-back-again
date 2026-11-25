import { at, bookSchema, editionSchema, type Book } from './schema'

const chapterData = [
  ['An Unexpected Party', 'At Bag End', 'Bilbo receives a most unexpected company at Bag End and hears what brings them to his door.'],
  ['Roast Mutton', 'On the road', 'Bilbo joins the company on the road. A light in the woods leads to a dangerous encounter with three trolls.'],
  ['A Short Rest', 'The hidden valley', 'The company rests in Rivendell, where Elrond examines the map they carry.'],
  ['Over Hill and under Hill', 'Into the mountains', 'A storm drives the travellers to seek shelter in the mountains, where they fall into the hands of goblins.'],
  ['Riddles in the Dark', 'Beneath the mountains', 'Separated from his companions, Bilbo finds an underground lake and meets Gollum.'],
  ['Out of the Frying-Pan into the Fire', 'East of the mountains', 'Bilbo rejoins the company. The eagles carry the travellers away from danger in the trees.'],
  ['Queer Lodgings', 'The wild country', 'The travellers find shelter with Beorn and make their way to the edge of Mirkwood.'],
]
const chapters = chapterData.map(([title, label, text], index) => {
  const number = index + 1
  return {
    number, title, reveal: at(number), completionEvent: 3,
    milestones: [
      { id: 'partway', label, reveal: at(number, 1) },
      ...(number === 1 ? [{ id: 'company-at-bag-end', label: 'The company arrives', reveal: at(1, 2) }] : []),
    ],
    recap: { id: `recap-${number}`, reveal: at(number, 3), text },
  }
})

export const hobbit: Book = bookSchema.parse({
  id: 'the-hobbit',
  title: 'The Hobbit',
  chapters: [...chapters, { number: 8, title: 'Flies and Spiders', reveal: at(8), milestones: [] }],
  landmarks: [
    { id: 'bag-end', name: 'Bag End', region: 'Hobbiton', point: [-48, 9], reveal: at(1, 1),
      scene: { id: 'bag-end', reveal: at(1, 1) },
      facts: [
        { id: 'hobbit-home', reveal: at(1, 1), text: 'At the top of the Hill in Hobbiton, a round green door opens into the comfortable home of Bilbo Baggins.' },
        { id: 'unexpected-company', reveal: at(1, 2), text: 'A quiet evening gives way to unexpected callers, music, and talk of a journey.' },
      ] },
    { id: 'trollshaws', name: 'The Trolls’ Camp', region: 'The Lone-lands', point: [-30, 8], reveal: at(2, 1),
      facts: [{ id: 'woodland-fire', reveal: at(2, 1), text: 'A fire among the trees draws Bilbo away from the road on a cold, wet evening.' }] },
    { id: 'rivendell', name: 'Rivendell', region: 'The hidden valley', point: [-12, 2], reveal: at(3, 1),
      facts: [{ id: 'valley-refuge', reveal: at(3, 1), text: 'Elrond’s house lies in a deep valley on the western side of the mountains. The company finds rest here before the crossing.' }] },
    { id: 'high-pass', name: 'Misty Mountains', region: 'The mountain pass', point: [3, -12], reveal: at(4, 1),
      facts: [{ id: 'mountain-track', reveal: at(4, 1), text: 'A narrow track climbs from the western foothills toward the high, rocky passes.' }] },
    { id: 'underground-lake', name: 'The Underground Lake', region: 'Beneath the mountains', point: [9, -5], reveal: at(5, 1),
      facts: [{ id: 'dark-water', reveal: at(5, 1), text: 'Deep inside the mountain, Bilbo comes to the edge of still water in the darkness.' }] },
    { id: 'burning-trees', name: 'The Burning Trees', region: 'Eastern foothills', point: [18, 4], reveal: at(6, 3),
      facts: [{ id: 'trees', reveal: at(6, 3), text: 'Driven up into the trees, the company is carried to safety by the eagles.' }] },
    { id: 'beorn', name: 'Beorn’s House', region: 'The wild country', point: [35, -7], reveal: at(7, 1),
      facts: [{ id: 'homestead', reveal: at(7, 1), text: 'Beyond the great river, Beorn’s timber home stands among meadows, hedges and gardens.' }] },
    { id: 'forest-gate', name: 'The Forest Gate', region: 'Western edge of Mirkwood', point: [49, -4], reveal: at(7, 3),
      facts: [{ id: 'woodland-threshold', reveal: at(7, 3), text: 'A narrow path leads beneath the trees at the western edge of the forest. Here the company parts from Gandalf.' }] },
  ],
  routes: [
    { id: 'west-road', reveal: at(2, 1), points: [[-48, 9], [-43, 12], [-38, 11], [-34, 9], [-30, 8]] },
    { id: 'valley-road', reveal: at(3, 1), points: [[-30, 8], [-25, 12], [-20, 9], [-17, 5], [-12, 2]] },
    { id: 'mountain-path', reveal: at(4, 1), points: [[-12, 2], [-8, -2], [-6, -7], [-2, -10], [3, -12]] },
    { id: 'under-mountain', reveal: at(5, 1), points: [[3, -12], [6, -10], [9, -5]] },
    { id: 'eastward', reveal: at(6, 3), points: [[9, -5], [13, -2], [18, 4]] },
    { id: 'wild-country', reveal: at(7, 1), points: [[18, 4], [24, 6], [28, 0], [32, -4], [35, -7]] },
    { id: 'forest-road', reveal: at(7, 3), points: [[35, -7], [40, -10], [45, -8], [49, -4]] },
  ],
  exhibits: [
    { id: 'bilbo', name: 'Bilbo Baggins', kind: 'character', subtitle: 'The master of Bag End', location: 'bag-end', reveal: at(1, 1),
      facts: [{ id: 'bilbo-at-home', reveal: at(1, 1), text: 'Bilbo leads a comfortable life on the Hill. His bright clothes, curly hair and bare, woolly feet are typical of hobbits.' }] },
    { id: 'gandalf', name: 'Gandalf', kind: 'character', subtitle: 'A wandering wizard', location: 'bag-end', reveal: at(1, 1),
      facts: [{ id: 'wizard-appearance', reveal: at(1, 1), text: 'An old man with a staff, a pointed blue hat, a long grey cloak and a white beard.' }] },
    { id: 'green-door', name: 'The Round Door', kind: 'object', subtitle: 'The entrance to Bag End', location: 'bag-end', reveal: at(1, 1),
      facts: [{ id: 'round-door', reveal: at(1, 1), text: 'The door is painted green and set with a brass knob in the very middle. It opens into a long, comfortable hallway.' }] },
    { id: 'elrond', name: 'Elrond', kind: 'character', subtitle: 'Host at Rivendell', location: 'rivendell', reveal: at(3, 1),
      facts: [{ id: 'elrond-host', reveal: at(3, 1), text: 'Elrond welcomes the company to his house in the valley.' }] },
    { id: 'beorn-character', name: 'Beorn', kind: 'character', subtitle: 'A host in the wild country', location: 'beorn', reveal: at(7, 1),
      facts: [{ id: 'beorn-host', reveal: at(7, 1), text: 'A strong, solitary man whose animals live around his house. Gandalf brings the travellers to his door.' }] },
  ],
})

export const enhancedEdition = editionSchema.parse({
  id: 'enhanced-local-pdf',
  bookId: hobbit.id,
  name: 'Enhanced Edition',
  chapterStarts: { 1: 25, 2: 42, 3: 54, 4: 61, 5: 70, 6: 84, 7: 96, 8: 113 },
})
