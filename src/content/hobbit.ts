import { chapters } from './chapters'
import { note, objects, profiles, reference, type Pages } from './notes'
import { at, bookSchema, editionSchema, type Book, type Coordinate, type Landmark } from './schema'

function place(id: string, name: string, region: string, point: Coordinate | undefined, chapter: number, event: number, pages: Pages, text: string): Landmark {
  return { id, name, region, point, reveal: at(chapter, event), facts: [note(id, chapter, event, pages, text)] }
}

const bagEnd = place('bag-end', 'Bag End', 'Hobbiton', [-48, 7], 1, 1, [25, 26],
  'At the top of the Hill in Hobbiton, a round green door opens into the comfortable home of Bilbo Baggins.')
bagEnd.scene = { id: 'bag-end', reveal: at(1, 1), rooms: [{ id: 'bag-end-interior', reveal: at(1, 1) }] }
bagEnd.facts.push(note('unexpected-company', 1, 2, [27, 34], 'A quiet evening gives way to unexpected callers, music, and talk of a journey.'))
bagEnd.links = [reference('bilbo', 'Lives here', 1, 1), reference('green-door', 'Entrance', 1, 1), reference('thorin', 'Leads the visiting company', 1, 2)]

const mirkwood = place('mirkwood', 'Mirkwood', 'Forest beyond the mountains', undefined, 1, 2, [35, 36],
  'Gandalf names the great forest when the company studies the country between their starting point and the Mountain.')
mirkwood.facts.push(note('approach', 7, 3, [109, 112],
  'The company approaches from the west along a lesser-used route that enters the trees north of the Carrock.'))

const forestGate = place('forest-gate', 'The Forest Gate', 'Western edge of Mirkwood', [33, -28], 7, 2, [109, 110],
  'Beorn directs the company north to a little-known path into the forest.')
forestGate.facts.push(note('forest-parting', 7, 3, [111, 112],
  'The party sends back the ponies and parts from Gandalf before taking the narrow track under the trees.'))
forestGate.links = [reference('mirkwood', 'Leads into', 7, 2), reference('beorn-character', 'Recommends the route', 7, 2)]

const aliases: Record<string, NonNullable<Book['exhibits'][number]['aliases']>> = {
  bilbo: [{ id: 'bilbo', name: 'Bilbo', reveal: at(1, 1), pages: [25, 26] }],
  william: [{ id: 'bill-huggins', name: 'Bill Huggins', reveal: at(2, 2), pages: [47, 47] }],
  rivendell: [{ id: 'homely-house', name: 'The Last Homely House', reveal: at(3, 1), pages: [53, 58] }],
  orcrist: [
    { id: 'orcrist', name: 'Orcrist', reveal: at(3, 2), pages: [59, 59] },
    { id: 'biter', name: 'Biter', reveal: at(4, 2), pages: [66, 67] },
  ],
  glamdring: [
    { id: 'glamdring', name: 'Glamdring', reveal: at(3, 2), pages: [59, 59] },
    { id: 'beater', name: 'Beater', reveal: at(4, 2), pages: [67, 68] },
  ],
}

const rivendell = place('rivendell', 'Rivendell', 'The hidden valley', [-12, 2], 3, 1, [54, 57],
  'Elrond’s house lies in a deep valley on the western side of the mountains. The company crosses the narrow bridge to find rest.')
rivendell.aliases = aliases.rivendell

export const hobbit: Book = bookSchema.parse({
  id: 'the-hobbit',
  title: 'The Hobbit',
  chapters,
  landmarks: [
    bagEnd,
    place('lonely-mountain', 'The Lonely Mountain', 'Described at Bag End', undefined, 1, 2, [36, 39],
      'The isolated mountain was the home of Thorin’s family. His grandfather’s map shows a hidden entrance in the side.'),
    place('dale', 'Dale', 'Valley below the Mountain', undefined, 1, 2, [36, 39],
      'Thorin remembers a thriving town known for craft and trade. His account describes its ruin after the dragon arrived.'),
    mirkwood,
    place('gondolin', 'Gondolin', 'Remembered by Elrond', undefined, 3, 2, [58, 59],
      'Elrond identifies this ancient Elven city as the place where Thorin’s and Gandalf’s swords were made.'),
    place('great-river', 'The Great River', 'East of the Misty Mountains', undefined, 7, 1, [96, 99],
      'The company crosses towards Beorn’s country after the eagles leave them at the great rock in the water.'),
    place('green-dragon', 'The Green Dragon', 'Bywater', [-43, 18], 2, 1, [42, 43], 'The inn at Bywater is the meeting place named in the dwarves’ letter to Bilbo.'),
    place('trollshaws', 'The Trolls’ Camp', 'The Lone-lands', [-30, 9], 2, 2, [45, 51], 'A fire among the trees draws Bilbo away from the road on a cold, wet evening.'),
    place('troll-hoard', 'The Trolls’ Hoard', 'The Lone-lands', [-27, 6], 2, 3, [51, 53], 'The key Bilbo finds opens a hidden store where the trolls kept food and plunder.'),
    rivendell,
    place('high-pass', 'Misty Mountains', 'The mountain pass', [3, -12], 4, 1, [61, 64], 'A crooked track climbs from the western foothills. A storm sweeps across the exposed mountainside.'),
    place('goblin-caverns', 'The Goblin Caverns', 'Under the high pass', [6, -12], 4, 2, [64, 69], 'The goblins take the travellers through a hidden gap in the rock, opening to a network of mountain passages.'),
    place('underground-lake', 'The Underground Lake', 'Beneath the mountains', [9, -5], 5, 1, [70, 72], 'Deep inside the mountain, Bilbo comes to the edge of still water in the darkness.'),
    place('eastern-slopes', 'The Eastern Slopes', 'East of the high pass', [14, -3], 6, 1, [84, 87], 'Bilbo catches up with the company on the far side of the mountains, and they hurry down the slopes.'),
    place('wolf-clearing', 'The Wolves’ Clearing', 'Eastern foothills', [18, 3], 6, 2, [87, 92], 'The wolves assemble beneath the trees where the company takes refuge.'),
    place('burning-trees', 'The Burning Trees', 'Eastern foothills', [19, 6], 6, 3, [90, 94], 'A fire around the trees threatens the company before they are carried out of the clearing.'),
    place('eagles-eyrie', 'The Eagles’ Eyries', 'Eastern crags', [16, -11], 6, 3, [93, 95], 'The eagles bring the company to rough ledges on the mountain, where they have supper and wait for morning.'),
    place('carrock', 'The Carrock', 'The Great River', [26.4, -1], 7, 1, [96, 98], 'A great rock rises in the river. The eagles set the company down there, and steps lead to a ford.'),
    place('beorn', 'Beorn’s House', 'The wild country', [37, -8], 7, 1, [97, 105], 'East of the Great River, Beorn’s timber house stands inside a high hedge among gardens, pastures and beehives.'),
    { ...forestGate, encounter: at(7, 3) },
  ],
  routes: [
    { id: 'bywater-road', reveal: at(2, 1), points: [[-48, 7], [-48, 12], [-45, 16], [-43, 18]] },
    { id: 'west-road', reveal: at(2, 2), points: [[-43, 18], [-39, 16], [-35, 12], [-30, 9]] },
    { id: 'to-hoard', reveal: at(2, 3), points: [[-30, 9], [-27, 6]] },
    { id: 'valley-road', reveal: at(3, 1), points: [[-27, 6], [-24, 10], [-20, 9], [-17, 5], [-12, 2]] },
    { id: 'mountain-path', reveal: at(4, 1), points: [[-12, 2], [-8, -2], [-6, -7], [-2, -10], [3, -12]] },
    { id: 'cave-path', reveal: at(4, 2), points: [[3, -12], [6, -12]] },
    { id: 'under-mountain', reveal: at(5, 1), points: [[6, -12], [7, -9], [9, -5]] },
    { id: 'eastward', reveal: at(6, 1), points: [[9, -5], [12, -3], [14, -3]] },
    { id: 'to-clearing', reveal: at(6, 2), points: [[14, -3], [16, 1], [18, 3]] },
    { id: 'to-eyrie', reveal: at(6, 3), points: [[18, 3], [19, 6], [20, -1], [16, -11]] },
    { id: 'to-carrock', reveal: at(7, 1), points: [[16, -11], [19, -6], [26.4, -1]] },
    { id: 'wild-country', reveal: at(7, 1), points: [[26.4, -1], [29, 0], [33, -3], [37, -8]] },
    { id: 'forest-road', reveal: at(7, 3), points: [[37, -8], [39, -12], [35, -17], [31, -24], [33, -28]] },
  ],
  exhibits: [...profiles, ...objects].map(item => ({ ...item, aliases: aliases[item.id] })),
})

export const enhancedEdition = editionSchema.parse({
  id: 'enhanced-local-pdf',
  bookId: hobbit.id,
  name: 'Enhanced Edition',
  storyEndPage: 209,
  chapterStarts: {
    1: 25, 2: 42, 3: 54, 4: 61, 5: 70, 6: 84, 7: 96, 8: 113, 9: 130, 10: 141,
    11: 149, 12: 155, 13: 168, 14: 175, 15: 181, 16: 188, 17: 192, 18: 199, 19: 204,
  },
})
