import { at, type EntryLink, type Exhibit, type Fact } from './schema'

export type Pages = NonNullable<Fact['pages']>

export const note = (id: string, chapter: number, event: number, pages: Pages, text: string, section?: Fact['section']): Fact =>
  ({ id, reveal: at(chapter, event), pages, text, section })

export const reference = (target: string, label: string, chapter: number, event: number, pages?: Pages): EntryLink =>
  ({ id: target, target, label, reveal: at(chapter, event), pages })

type Profile = Pick<Exhibit, 'id' | 'name' | 'subtitle' | 'location'>
const mentionedCharacters = new Set(['belladonna', 'bungo', 'old-took', 'bullroarer', 'thror', 'thrain', 'thrain-old', 'durin', 'smaug'])

type Portrait = NonNullable<Exhibit['portrait']>['style']

function character(profile: Profile, style: Portrait, facts: Fact[], links: EntryLink[] = []): Exhibit {
  const reveal = facts[0].reveal
  return { ...profile, reveal, encounter: mentionedCharacters.has(profile.id) ? null : reveal, kind: 'character', facts, links, portrait: { id: profile.id, style, reveal } }
}

function object(id: string, name: string, subtitle: string, location: string, facts: Fact[], links: EntryLink[] = []): Exhibit {
  return { id, name, subtitle, location, kind: 'object', reveal: facts[0].reveal, facts, links }
}

const appearance = (id: string, c: number, e: number, p: Pages, text: string) => note(id, c, e, p, text, 'Appearance')
const background = (id: string, c: number, e: number, p: Pages, text: string) => note(id, c, e, p, text, 'Background')
const development = (id: string, c: number, e: number, p: Pages, text: string) => note(id, c, e, p, text, 'Developments')

const dwarfNotes: Array<[string, string, Pages, string, Fact[], EntryLink[]?]> = [
  ['dwalin', 'Dwalin', [27, 28], 'His beard is blue, his hood dark green, and his belt gold. He is the first dwarf through the door.', [
    development('borrowed-cloak', 2, 1, [43, 43], 'He lends Bilbo a cloak and hood for the journey.'),
  ], [reference('balin', 'Brother', 1, 2, [29, 29]), reference('travel-cloak', 'Lends', 2, 1)]],
  ['balin', 'Balin', [28, 29], 'An older dwarf with a white beard and a scarlet hood. He is Dwalin’s brother.', [
    development('lookout', 2, 1, [43, 45], 'He watches for Bilbo at the inn and later spots the distant light.'),
    development('reunion', 6, 1, [84, 85], 'Bilbo slips past him on watch and surprises the company.'),
  ], [reference('dwalin', 'Brother', 1, 2, [29, 29])]],
  ['fili', 'Fili', [29, 29], 'A younger dwarf with a yellow beard, a blue hood and a silver belt. He plays the fiddle.', [
    development('shelter', 4, 1, [63, 64], 'He and Kili report a cave large enough for the company and the ponies.'),
  ], [reference('kili', 'Scouts with', 4, 1)]],
  ['kili', 'Kili', [29, 29], 'A younger dwarf with a yellow beard, a blue hood and a silver belt. He plays the fiddle.', [
    development('shelter', 4, 1, [63, 64], 'He and Fili search the rock face for shelter from the storm.'),
  ], [reference('fili', 'Scouts with', 4, 1)]],
  ['dori', 'Dori', [29, 32], 'One of five dwarves who arrive together. He brings a flute to the gathering.', [
    development('carries-bilbo', 4, 2, [67, 69], 'He carries Bilbo through the goblin tunnels until a pursuer grabs him.'),
    development('last-away', 6, 3, [92, 94], 'He helps Bilbo reach the trees. Bilbo hangs onto his ankles when the eagles lift them away.'),
  ], [reference('bilbo', 'Carries', 4, 2)]],
  ['nori', 'Nori', [29, 32], 'Arrives with Dori, Ori, Oin and Gloin. He joins Dori and Ori on flute.', [
    development('rain', 2, 1, [44, 45], 'He and Dori wish Gandalf were with them while they struggle in the rain.'),
  ]],
  ['ori', 'Ori', [29, 32], 'Arrives in the group of five and joins in on flute.', [
    development('tree', 6, 2, [88, 89], 'He takes shelter with Dori, Nori, Oin and Gloin in the branches of one tree.'),
  ]],
  ['oin', 'Oin', [29, 31], 'Arrives with the group of five and calls for mince pies.', [
    development('fire-making', 2, 1, [44, 45], 'He and Gloin are skilled at lighting fires but fail to get one going in the rain.'),
  ], [reference('gloin', 'Makes campfires with', 2, 1)]],
  ['gloin', 'Gloin', [29, 36], 'One of the five who arrive together. He openly doubts whether Bilbo is suited to the venture.', [
    development('fire-making', 2, 1, [44, 45], 'He and Oin try and fail to light a fire with damp fuel.'),
  ], [reference('oin', 'Makes campfires with', 2, 1)]],
  ['bifur', 'Bifur', [30, 32], 'Arrives with Bofur, Bombur and Thorin. He brings a clarinet.', [
    development('visit', 7, 1, [103, 104], 'He is among the last dwarves Gandalf introduces to Beorn.'),
  ], [reference('bofur', 'Plays music with', 1, 2)]],
  ['bofur', 'Bofur', [30, 32], 'Arrives with Bifur, Bombur and Thorin. He brings a clarinet.', [
    development('visit', 7, 1, [103, 104], 'He enters Beorn’s yard near the end of Gandalf’s staggered introductions.'),
  ], [reference('bifur', 'Plays music with', 1, 2)]],
  ['bombur', 'Bombur', [30, 32], 'A very stout dwarf who lands on Thorin in the doorway. He brings a drum.', [
    development('branches', 6, 2, [88, 89], 'He is pulled into the branches when the wolves surround the company.'),
    development('introduction', 7, 1, [99, 104], 'Gandalf counts him as two guests while planning the introductions. He arrives last.'),
  ]],
]

export const profiles: Exhibit[] = [
  character({ id: 'bilbo', name: 'Bilbo Baggins', subtitle: 'Hobbit', location: 'bag-end' }, 'hobbit', [
    appearance('clothes', 1, 1, [25, 26], 'Short, curly-haired and barefoot, Bilbo favours bright clothes. He smokes a very long pipe outside his round green door.'),
    background('home', 1, 1, [25, 26], 'He inherits a comfortable home and the Baggins reputation for being predictable. His mother’s Took family has a reputation for adventure.'),
    development('party', 1, 2, [34, 41], 'The dwarves’ music and story stir his curiosity. He bristles at the suggestion that he is unsuited to their venture.'),
    development('trolls', 2, 2, [45, 51], 'Asked to investigate a distant fire, he attempts to pick a troll’s pocket and is caught.'),
    development('valley', 3, 2, [58, 60], 'He is sorry to leave Rivendell after the first safe rest of the journey.'),
    development('lost', 4, 2, [67, 69], 'Dori carries him away from the goblins. In the pursuit Bilbo falls and is left in the dark.'),
    development('riddles', 5, 2, [71, 83], 'He exchanges riddles with Gollum, discovers what the ring does, and chooses to leap past Gollum when he could strike.'),
    development('keeps-secret', 6, 1, [84, 86], 'He surprises the company on his return and tells them about his escape while keeping the ring to himself.'),
    development('garden', 7, 1, [99, 106], 'He accompanies Gandalf to Beorn’s house and notices how skilfully the animals serve their host.'),
  ], [
    reference('belladonna', 'Mother', 1, 1), reference('bungo', 'Father', 1, 1),
    reference('gandalf', 'Recruits him', 1, 2), reference('bag-end', 'Home', 1, 1),
    reference('bilbo-dagger', 'Carries', 2, 3), reference('plain-ring', 'Finds', 5, 1), reference('gollum', 'Exchanges riddles with', 5, 2),
    reference('trollshaws', 'Investigates the fire', 2, 2), reference('rivendell', 'Rests here', 3, 1),
    reference('underground-lake', 'Reaches alone', 5, 1), reference('beorn', 'Visits with Gandalf', 7, 1),
  ]),
  character({ id: 'gandalf', name: 'Gandalf', subtitle: 'Wizard', location: 'bag-end' }, 'wizard', [
    appearance('wizard-appearance', 1, 1, [26, 26], 'An old man with a staff, a tall pointed blue hat, a long grey cloak, a silver scarf and a long white beard.'),
    background('took-friend', 1, 1, [26, 27], 'Bilbo remembers him for fireworks and for being associated with adventures in the Took family.'),
    development('organizer', 1, 2, [35, 41], 'He recommends Bilbo and brings Thorin a map and a key that came from Thorin’s father.'),
    development('dawn', 2, 3, [49, 52], 'He imitates the trolls’ voices so that they argue until the sun comes up.'),
    development('rescuer', 4, 2, [65, 68], 'He strikes down the Great Goblin and leads the captives into the tunnels.'),
    development('tactics', 6, 2, [88, 90], 'He throws burning pinecones from a tree as wolves gather underneath.'),
    development('host', 7, 1, [97, 104], 'He introduces the company to Beorn in stages to keep their host listening.'),
    development('parting', 7, 3, [111, 112], 'He parts from the company at the forest entrance, urging them to stay on the path.'),
  ], [reference('wizard-staff', 'Carries', 1, 1), reference('thror-map', 'Brings to Thorin', 1, 2), reference('glamdring', 'Chooses', 2, 3), reference('forest-gate', 'Parts from the company', 7, 3)]),
  character({ id: 'thorin', name: 'Thorin Oakenshield', subtitle: 'Dwarf · leader of the company', location: 'bag-end' }, 'dwarf', [
    appearance('hood', 1, 2, [30, 32], 'He has a sky-blue hood with a silver tassel, wears a gold chain and plays a harp.'),
    background('exile', 1, 2, [36, 41], 'Grandson of Thror and son of Thrain, he speaks formally and leads the venture to reclaim his family’s home and treasure.'),
    development('sword', 3, 2, [58, 60], 'Elrond identifies the blade he took from the troll hoard and deciphers the hidden script on his map.'),
    development('captive', 4, 2, [65, 67], 'He speaks for the captives until the Great Goblin recognises his sword.'),
    development('guest', 7, 1, [102, 103], 'Introduced to Beorn alongside Dori, he confirms his ancestry when challenged.'),
  ], [reference('thrain', 'Father', 1, 2), reference('thror', 'Grandfather', 1, 2), reference('thror-map', 'Keeps', 1, 2), reference('orcrist', 'Carries', 2, 3)]),
  ...dwarfNotes.map(([id, name, pages, text, developments, links]) => character(
    { id, name, subtitle: 'Dwarf · member of the company', location: 'bag-end' }, 'dwarf',
    [appearance('arrival', 1, 2, pages, text), ...developments], links,
  )),
  character({ id: 'belladonna', name: 'Belladonna Took', subtitle: 'Hobbit · Bilbo’s mother', location: 'bag-end' }, 'hobbit', [
    background('took', 1, 1, [25, 27], 'A daughter of the Old Took and wife of Bungo. Gandalf remembers her, and Bilbo grew up in the home Bungo built for their family.'),
  ], [reference('bilbo', 'Son', 1, 1), reference('bungo', 'Husband', 1, 1), reference('old-took', 'Father', 1, 1)]),
  character({ id: 'bungo', name: 'Bungo Baggins', subtitle: 'Hobbit · Bilbo’s father', location: 'bag-end' }, 'hobbit', [
    background('builder', 1, 1, [25, 26], 'He builds the comfortable hobbit-hole on the Hill for Belladonna and himself. Bilbo inherits the home and the Baggins name.'),
  ], [reference('belladonna', 'Wife', 1, 1), reference('bilbo', 'Son', 1, 1)]),
  character({ id: 'old-took', name: 'The Old Took', subtitle: 'Hobbit · head of the Took family', location: 'bag-end' }, 'hobbit', [
    background('family', 1, 1, [25, 27], 'Bilbo’s maternal grandfather. Bilbo associates Gandalf with his parties and their fireworks.'),
  ], [reference('belladonna', 'Daughter', 1, 1)]),
  character({ id: 'bullroarer', name: 'Bullroarer Took', subtitle: 'Hobbit · Bilbo’s ancestor', location: 'bag-end' }, 'hobbit', [
    background('ancestor', 1, 2, [34, 35], 'A remarkably large hobbit remembered in a comic story about the Battle of the Green Fields.'),
  ], [reference('bilbo', 'Descendant', 1, 2)]),
  character({ id: 'thror', name: 'Thror', subtitle: 'Dwarf · Thorin’s grandfather', location: 'bag-end' }, 'dwarf', [
    background('mapmaker', 1, 2, [36, 40], 'The maker of the map Gandalf gives Thorin. Thorin describes how he and Thrain escaped their home when Smaug attacked.'),
    development('script', 3, 2, [59, 60], 'Elrond finds concealed writing on the map and explains the conditions needed to read it.'),
  ], [reference('thorin', 'Grandson', 1, 2), reference('thrain', 'Son', 1, 2), reference('thror-map', 'Draws', 1, 2)]),
  character({ id: 'thrain', name: 'Thrain', subtitle: 'Dwarf · Thorin’s father', location: 'bag-end' }, 'dwarf', [
    background('inheritance', 1, 2, [39, 41], 'Gandalf says he received the map and key from Thorin’s father after finding him imprisoned and in ruin.'),
  ], [reference('thorin', 'Son', 1, 2), reference('thror', 'Father', 1, 2), reference('thror-map', 'Entrusts to Gandalf', 1, 2)]),
  character({ id: 'thrain-old', name: 'Thrain the Old', subtitle: 'Dwarf · ancestor of Thorin', location: 'lonely-mountain' }, 'dwarf', [
    background('founds', 1, 2, [38, 38], 'Thorin credits this far ancestor with discovering the Mountain which later became the home of his grandfather’s family.'),
  ], [reference('lonely-mountain', 'Discovers', 1, 2)]),
  character({ id: 'durin', name: 'Durin', subtitle: 'Dwarf · ancestor named by Thorin', location: 'rivendell' }, 'dwarf', [
    background('ancestor', 3, 2, [59, 60], 'Thorin calls him the ancestor of the eldest line of dwarves while discussing the day named for him.'),
  ], [reference('thror-map', 'Named in the writing on', 3, 2)]),
  character({ id: 'smaug', name: 'Smaug', subtitle: 'Dragon · described at Bag End', location: 'bag-end' }, 'dragon', [
    background('account', 1, 2, [38, 39], 'In Thorin’s account, Smaug comes from the north, devastates the valley and seizes the dwarves’ treasure.'),
  ]),
  ...([
    ['william', 'William', 'His pocket holds the purse that alerts him to Bilbo. Well fed, he initially tells the others to let the hobbit go.'],
    ['bert', 'Bert', 'He quarrels with William over their food and the fate of the captives. He wants to roast the dwarves.'],
    ['tom', 'Tom', 'He joins the squabble and helps capture the dwarves as they approach the fire.'],
  ] as const).map(([id, name, text]) => character({ id, name, subtitle: 'Troll', location: 'trollshaws' }, 'troll', [
    appearance('camp', 2, 2, [45, 49], 'One of three very large trolls by a fire. Bilbo recognises them by their faces and size.'),
    development('argument', 2, 2, [46, 50], text),
    development('dawn', 2, 3, [50, 51], 'He is still outside when the sun rises and turns him to stone.'),
  ], [reference('trolls-purse', 'At the camp', 2, 2), reference('troll-hoard', 'Hidden store', 2, 3)])),
  character({ id: 'elrond', name: 'Elrond', subtitle: 'Master of Rivendell', location: 'rivendell' }, 'elf', [
    appearance('demeanour', 3, 1, [57, 58], 'The narrator gives him the dignity of a king, the strength of a warrior and the warmth of a summer day.'),
    background('lineage', 3, 1, [57, 58], 'His ancestry reaches to both Elves and men. He offers the travellers a safe rest at his house.'),
    development('reading', 3, 2, [58, 60], 'He identifies two blades from Gondolin and reads the moon-letters on Thror’s map.'),
  ], [reference('rivendell', 'Home', 3, 1), reference('thror-map', 'Deciphers', 3, 2), reference('orcrist', 'Identifies', 3, 2), reference('glamdring', 'Identifies', 3, 2)]),
  character({ id: 'rivendell-elves', name: 'The Elves of Rivendell', subtitle: 'Elves · the hidden valley', location: 'rivendell' }, 'elf', [
    background('greeting', 3, 1, [55, 58], 'They greet the travellers with teasing songs in the trees and direct them towards the bridge and Elrond’s house.'),
  ]),
  character({ id: 'stone-giants', name: 'Stone-giants', subtitle: 'Giants · Misty Mountains', location: 'high-pass' }, 'troll', [
    appearance('storm', 4, 1, [62, 63], 'Bilbo sees giants across the valley in a flash of lightning. They hurl rocks to one another while the storm rages.'),
  ]),
  character({ id: 'great-goblin', name: 'The Great Goblin', subtitle: 'Goblin · leader in the mountain', location: 'goblin-caverns' }, 'shadow', [
    appearance('hall', 4, 2, [65, 66], 'A huge goblin with an enormous head. He questions the prisoners from his seat in the underground hall.'),
    development('sword', 4, 2, [66, 68], 'He reacts furiously to Thorin’s blade and is struck down when Gandalf intervenes.'),
  ], [reference('orcrist', 'Recognises', 4, 2)]),
  character({ id: 'mountain-goblins', name: 'The Mountain Goblins', subtitle: 'Goblins · Misty Mountains', location: 'goblin-caverns' }, 'shadow', [
    background('tunnels', 4, 2, [64, 68], 'They capture the travellers through an opening at the back of the cave. The narrator describes their skill at tunnelling and making cruel devices.'),
    development('pursuit', 6, 2, [89, 93], 'They come upon the company in the trees and use fire to drive them down.'),
  ], [reference('wargs', 'Meet in the clearing', 6, 2)]),
  character({ id: 'gollum', name: 'Gollum', subtitle: 'Dweller by the underground lake', location: 'underground-lake' }, 'shadow', [
    appearance('eyes', 5, 2, [72, 74], 'A small, dark figure with broad feet and pale, luminous eyes. He paddles a little boat from an island in the lake.'),
    background('habits', 5, 2, [72, 75], 'He lives largely on fish, speaks to himself, and treats the riddle game seriously even as he weighs what to do about the stranger.'),
    development('keepsake', 5, 2, [77, 82], 'Losing his prized ring makes him suspect Bilbo. His talk and movement through the passages help Bilbo find the way out.'),
  ], [reference('plain-ring', 'Former keeper', 5, 2), reference('lake-boat', 'Uses', 5, 2), reference('bilbo', 'Exchanges riddles with', 5, 2)]),
  character({ id: 'wargs', name: 'Wargs', subtitle: 'Wild wolves', location: 'wolf-clearing' }, 'shadow', [
    appearance('assembly', 6, 2, [87, 90], 'The wolves gather in a clearing, speak together and surround the trees. Gandalf understands what they are saying.'),
    development('goblins', 6, 2, [89, 93], 'They are awaiting their goblin allies. Fire from Gandalf scatters some and drives others into a frenzy.'),
  ], [reference('mountain-goblins', 'Allies', 6, 2)]),
  character({ id: 'eagle-lord', name: 'The Lord of the Eagles', subtitle: 'Eagle · Misty Mountains', location: 'eagles-eyrie' }, 'eagle', [
    appearance('sight', 6, 3, [91, 94], 'A great eagle whose sharp sight picks out the disturbance far below. His followers fly down from the mountains with him.'),
    background('aid', 6, 3, [94, 95], 'Gandalf once healed an arrow wound for him. He offers the travellers food and a night’s shelter.'),
    development('carrock', 7, 1, [96, 97], 'He and the other eagles carry the company to the rock in the Great River.'),
  ], [reference('gandalf', 'Owes him a favour', 6, 3), reference('carrock', 'Sets the company down', 7, 1)]),
  character({ id: 'beorn-character', name: 'Beorn', subtitle: 'Skin-changer · host in the wild country', location: 'beorn' }, 'bear', [
    appearance('stature', 7, 1, [98, 101], 'An enormous man with black hair and beard, bare strong arms and a rough woollen tunic. Gandalf says he can take the form of a great black bear.'),
    background('household', 7, 1, [98, 105], 'He keeps bees, grows food and treats his extraordinary animals as members of the household. He is guarded around strangers and hates goblins.'),
    development('visitors', 7, 1, [101, 105], 'The story of the goblins persuades him to hear out Gandalf’s arriving companions.'),
    development('aid', 7, 2, [106, 110], 'He verifies Gandalf’s account, lends riding animals, provides food and recommends a route north to the forest entrance.'),
  ], [reference('beorn', 'Home', 7, 1), reference('beorn-animals', 'Household', 7, 1), reference('honey-cakes', 'Provides', 7, 2), reference('carrock', 'Made the steps', 7, 1)]),
  character({ id: 'beorn-animals', name: 'Beorn’s Animals', subtitle: 'Household animals · the wild country', location: 'beorn' }, 'bear', [
    background('helpers', 7, 1, [100, 106], 'Beorn speaks with his animals. His dogs, sheep and ponies help lay out the supper in ways that astonish Bilbo.'),
    development('loan', 7, 2, [108, 110], 'Beorn lends the company ponies on condition that they send them home at the forest entrance.'),
  ], [reference('beorn-character', 'Cares for them', 7, 1)]),
]

export const objects = [
  object('dining-table', 'The Dining Table', 'Household furniture · Bag End', 'bag-end', [
    background('dining-room', 1, 1, [25, 25], 'Bag End has dining rooms off its main passage, on the same level as the rest of the house.'),
    development('supper', 1, 2, [30, 32], 'Gandalf takes the head of the table as the company sits down. Bilbo has to make room for far more guests than he expected.'),
  ], [reference('bag-end', 'Inside', 1, 1), reference('gandalf', 'Sits at the head', 1, 2)]),
  object('green-door', 'The Round Door', 'Entrance · Bag End', 'bag-end', [
    appearance('round-door', 1, 1, [25, 25], 'A round green door with a brass knob at its centre opens into a panelled tunnel with rooms off either side.'),
    development('mark', 1, 2, [27, 35], 'Gandalf cuts a sign on the door that directs the visiting dwarves to the right house.'),
  ], [reference('bag-end', 'Entrance to', 1, 1)]),
  object('bilbos-pipe', 'Bilbo’s Pipe', 'Personal possession', 'bag-end', [
    appearance('long-pipe', 1, 1, [26, 26], 'Bilbo sits outside Bag End smoking a pipe that almost reaches his toes.'),
    development('returned', 2, 1, [43, 43], 'Gandalf catches up with the company carrying Bilbo’s pipe and tobacco, as well as pocket-handkerchiefs.'),
  ], [reference('bilbo', 'Belongs to', 1, 1)]),
  object('wizard-staff', 'Gandalf’s Staff', 'Walking staff', 'bag-end', [
    appearance('staff', 1, 1, [26, 26], 'The staff is one of the first things Bilbo sees when the wizard arrives at the Hill.'),
  ], [reference('gandalf', 'Carried by', 1, 1)]),
  object('instruments', 'The Dwarves’ Instruments', 'Music · the unexpected party', 'bag-end', [
    appearance('party-music', 1, 2, [32, 34], 'Fiddles, flutes, clarinets, a drum, a viol and Thorin’s harp accompany the song. The music helps Bilbo imagine the world beyond his home.'),
  ], [reference('thorin', 'Plays the harp', 1, 2), reference('bombur', 'Brings a drum', 1, 2)]),
  object('thror-map', 'Thror’s Map', 'Map · carried by Thorin', 'bag-end', [
    background('runes', 1, 2, [36, 38], 'The map shows a hidden entrance into the Mountain. Its marks and runes matter more to the company than its shape.'),
    development('moon-letters', 3, 2, [59, 60], 'The moon-letters appear in matching moonlight and give instructions about the hidden door and a clue connected with Durin’s Day.'),
  ], [reference('thror', 'Made by', 1, 2), reference('thorin', 'Given to', 1, 2), reference('elrond', 'Reads the moon-letters', 3, 2), reference('thror-key', 'Paired with', 1, 2)]),
  object('thror-key', 'The Small Silver Key', 'Key · delivered with Thror’s map', 'bag-end', [
    appearance('key', 1, 2, [37, 38], 'Gandalf gives Thorin a small silver key on a wire, intended for the hidden door shown on the map.'),
  ], [reference('thror-map', 'Paired with', 1, 2), reference('thorin', 'Keeps', 1, 2)]),
  object('hidden-door', 'The Mountain’s Hidden Door', 'Entrance · described on the map', 'lonely-mountain', [
    background('small-door', 1, 2, [36, 38], 'The map marks a small hidden entrance, separate from the main gate. Gandalf gives Thorin a key for it.'),
    development('clue', 3, 2, [59, 60], 'Elrond’s reading gives the company more information about how they might find the keyhole.'),
  ], [reference('thror-key', 'Key for', 1, 2), reference('thror-map', 'Marked on', 1, 2)]),
  object('company-letter', 'The Company’s Letter', 'Letter · left for Bilbo', 'bag-end', [
    background('terms', 2, 1, [42, 43], 'The letter sets out terms for Bilbo’s work and tells him to meet the company at the Green Dragon.'),
  ], [reference('green-dragon', 'Meeting place', 2, 1), reference('bilbo', 'Addressee', 2, 1)]),
  object('travel-cloak', 'Dwalin’s Travelling Cloak', 'Clothing · loaned to Bilbo', 'green-dragon', [
    appearance('cloak', 2, 1, [43, 43], 'Bilbo borrows a dark-green cloak and hood from Dwalin. Both are large on him.'),
  ], [reference('dwalin', 'Lender', 2, 1), reference('bilbo', 'Borrower', 2, 1)]),
  object('trolls-purse', 'William’s Purse', 'Purse · troll camp', 'trollshaws', [
    development('purse-cries', 2, 2, [46, 47], 'The purse cries out when Bilbo removes it from William’s pocket, giving his attempted theft away.'),
  ], [reference('william', 'Belongs to', 2, 2), reference('bilbo', 'Tries to take', 2, 2)]),
  object('troll-key', 'The Trolls’ Key', 'Key · troll hoard', 'troll-hoard', [
    development('find', 2, 3, [51, 52], 'Bilbo finds the key where the trolls fought. It opens the stone door to their store.'),
  ], [reference('troll-hoard', 'Opens', 2, 3)]),
  object('orcrist', 'Thorin’s Sword', 'Elven blade', 'troll-hoard', [
    appearance('hoard-sword', 2, 3, [51, 52], 'Thorin takes an unusually fine old sword from the trolls’ store.'),
    development('name', 3, 2, [58, 59], 'Elrond names it Orcrist and identifies it as an old sword from Gondolin.'),
    development('goblin-name', 4, 2, [66, 67], 'The goblins recognise and fear it. Their name for the blade is Biter.'),
  ], [reference('thorin', 'Carries', 2, 3), reference('elrond', 'Identifies', 3, 2)]),
  object('glamdring', 'Gandalf’s Sword', 'Elven blade', 'troll-hoard', [
    appearance('hoard-sword', 2, 3, [51, 52], 'Gandalf selects one of the old swords in the trolls’ store.'),
    development('name', 3, 2, [58, 59], 'Elrond names it Glamdring, the Foe-hammer, and says it was carried by the king of Gondolin.'),
    development('beater', 4, 2, [67, 68], 'The goblins know the blade as Beater. Gandalf uses it in the tunnels.'),
  ], [reference('gandalf', 'Carries', 2, 3), reference('elrond', 'Identifies', 3, 2)]),
  object('bilbo-dagger', 'Bilbo’s Dagger', 'Elven blade', 'troll-hoard', [
    appearance('small-blade', 2, 3, [51, 52], 'A knife for a troll is large enough to serve Bilbo as a sword. He takes it from the store.'),
    development('glimmer', 5, 1, [70, 72], 'Its faint light helps him walk through the tunnels and tells him something about the nearness of goblins.'),
  ], [reference('bilbo', 'Carries', 2, 3), reference('underground-lake', 'Used on the way to', 5, 1)]),
  object('plain-ring', 'The Plain Ring', 'Pocket-sized find · Misty Mountains', 'underground-lake', [
    appearance('floor', 5, 1, [70, 71], 'Bilbo feels a small, cold ring on the tunnel floor and puts it into his pocket.'),
    appearance('gold-band', 5, 2, [77, 77], 'Gollum’s recollection describes his ring as golden.'),
    development('effect', 5, 2, [77, 83], 'He learns it can hide its wearer from sight. He uses it to escape past Gollum and the goblins.'),
    development('secret', 6, 1, [84, 86], 'He leaves the ring out of the story he tells the company.'),
  ], [reference('bilbo', 'Finds', 5, 1), reference('gollum', 'Former keeper', 5, 2)]),
  object('lake-boat', 'Gollum’s Boat', 'Small boat · underground lake', 'underground-lake', [
    appearance('boat', 5, 2, [72, 74], 'Gollum uses a small boat to reach the shore from his island, paddling without making a ripple.'),
  ], [reference('gollum', 'Uses', 5, 2)]),
  object('pinecones', 'The Burning Pinecones', 'Improvised defence · eastern foothills', 'wolf-clearing', [
    development('pine-fire', 6, 2, [88, 90], 'Gandalf lights pinecones and throws them among the wolves, using different coloured flames as the attackers close in.'),
  ], [reference('gandalf', 'Uses', 6, 2)]),
  object('honey-cakes', 'Beorn’s Honey-cakes', 'Provisions · the wild country', 'beorn', [
    development('cakes', 7, 2, [108, 109], 'Twice-baked cakes made with honey are among the provisions Beorn packs. They keep well and go a long way.'),
  ], [reference('beorn-character', 'Provides', 7, 2)]),
]
