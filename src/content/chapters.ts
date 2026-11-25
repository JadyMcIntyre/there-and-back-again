import { at, type Chapter } from './schema'
import { note, reference, type Pages } from './notes'

type Outline = {
  title: string, pages: Pages, checkpoints: [string, string], focus: [string, string, string],
  summary: string, events: Array<[Pages, string]>, remember: Array<[Pages, string]>,
  entries: Array<[string, string]>,
}

const outlines: Outline[] = [
  {
    title: 'An Unexpected Party', pages: [25, 41],
    checkpoints: ['At Bag End', 'The party and its plans'], focus: ['bag-end', 'bag-end', 'bag-end'],
    summary: 'Bilbo’s morning outside Bag End ends with a visit from Gandalf and an invitation he has little wish to accept. By the following evening, dwarves are arriving in groups and treating his house as their meeting place. Their music and Thorin’s account of the Mountain stir a curiosity Bilbo rarely indulges. He overhears doubts about his suitability, protests, and finds himself drawn into the plans. Gandalf gives Thorin a map and key and explains how they came into his hands.',
    events: [
      [[25, 27], 'Gandalf pays a call and marks the door after Bilbo withdraws inside.'],
      [[28, 34], 'Thirteen dwarves gather. Their song describes the home and treasure taken from them.'],
      [[35, 41], 'The party discusses Bilbo’s role, the hidden entrance and Thorin’s family history.'],
    ],
    remember: [
      [[25, 27], 'Bilbo’s attachment to routine sits alongside his curiosity, which the book associates with the Took side of his family.'],
      [[36, 40], 'The map and key travel together. The main entrance and the small hidden door are distinct.'],
    ],
    entries: [['bilbo', 'Bilbo Baggins'], ['gandalf', 'Gandalf'], ['belladonna', 'Belladonna Took'], ['bungo', 'Bungo Baggins'], ['old-took', 'The Old Took'], ['bullroarer', 'Bullroarer Took'], ['thorin', 'Thorin Oakenshield'], ['dwalin', 'Dwalin'], ['balin', 'Balin'], ['fili', 'Fili'], ['kili', 'Kili'], ['dori', 'Dori'], ['nori', 'Nori'], ['ori', 'Ori'], ['oin', 'Oin'], ['gloin', 'Gloin'], ['bifur', 'Bifur'], ['bofur', 'Bofur'], ['bombur', 'Bombur'], ['smaug', 'Smaug'], ['thror', 'Thror'], ['thrain', 'Thrain'], ['thrain-old', 'Thrain the Old'], ['thror-map', 'Thror’s Map'], ['thror-key', 'The Small Silver Key'], ['hidden-door', 'The Mountain’s Hidden Door'], ['instruments', 'The Dwarves’ Instruments'], ['bag-end', 'Bag End'], ['lonely-mountain', 'The Lonely Mountain'], ['dale', 'Dale'], ['mirkwood', 'Mirkwood']],
  },
  {
    title: 'Roast Mutton', pages: [42, 53],
    checkpoints: ['On the road', 'At the trolls’ fire'], focus: ['green-dragon', 'trollshaws', 'troll-hoard'],
    summary: 'A letter left at Bag End sends Bilbo racing to the Green Dragon to join the company. The pleasant ride turns bleak as they travel into rougher country and lose provisions in a flooded river. Bilbo goes to investigate a light and tries to steal from one of three trolls. His attempt fails, and the dwarves are caught when they follow. Gandalf keeps the trolls quarrelling until sunrise. The travellers find the trolls’ store, take food and weapons, and bury the gold they cannot carry.',
    events: [
      [[42, 45], 'The party sets out from the inn and has a miserable stop in rain and darkness.'],
      [[45, 49], 'A speaking purse betrays Bilbo. The trolls seize the dwarves as they enter the clearing.'],
      [[49, 53], 'Gandalf tricks the trolls into staying outside until dawn. A key found nearby opens their store.'],
    ],
    remember: [
      [[43, 43], 'Bilbo leaves in a hurry and borrows Dwalin’s cloak and hood.'],
      [[51, 52], 'Thorin and Gandalf take swords and Bilbo takes a knife large enough to use as a sword.'],
    ],
    entries: [['green-dragon', 'The Green Dragon'], ['company-letter', 'The Company’s Letter'], ['trollshaws', 'The Trolls’ Camp'], ['william', 'William'], ['bert', 'Bert'], ['tom', 'Tom'], ['trolls-purse', 'William’s Purse'], ['troll-key', 'The Trolls’ Key'], ['troll-hoard', 'The Trolls’ Hoard'], ['orcrist', 'Thorin’s Sword'], ['glamdring', 'Gandalf’s Sword'], ['bilbo-dagger', 'Bilbo’s Dagger']],
  },
  {
    title: 'A Short Rest', pages: [54, 60],
    checkpoints: ['In the hidden valley', 'Elrond examines the map'], focus: ['rivendell', 'rivendell', 'rivendell'],
    summary: 'The travellers see the Misty Mountains ahead and descend into a steep valley after following Gandalf and a path marked with white stones. The elves greet them in song. At Elrond’s house they rest, mend and prepare for the mountains. Elrond recognises the swords from the troll hoard as blades from Gondolin. Light from the right kind of moon reveals writing on the map that the company had overlooked, giving them another clue about the hidden door.',
    events: [
      [[54, 57], 'Gandalf finds the valley path. The company crosses a narrow bridge over the rushing water.'],
      [[57, 59], 'Elrond welcomes the travellers and identifies Thorin’s and Gandalf’s swords.'],
      [[59, 60], 'He reads the moon-letters and discusses Durin’s Day with Thorin.'],
    ],
    remember: [
      [[58, 59], 'Orcrist is Thorin’s sword. Glamdring is Gandalf’s. Both came from Gondolin.'],
      [[59, 60], 'The invisible writing needs moonlight matching the phase and season of its writing.'],
    ],
    entries: [['elrond', 'Elrond'], ['durin', 'Durin'], ['rivendell-elves', 'The Elves of Rivendell'], ['rivendell', 'Rivendell'], ['gondolin', 'Gondolin'], ['thror-map', 'Thror’s Map'], ['orcrist', 'Thorin’s Sword'], ['glamdring', 'Gandalf’s Sword']],
  },
  {
    title: 'Over Hill and under Hill', pages: [61, 69],
    checkpoints: ['At the mountain pass', 'In the goblin tunnels'], focus: ['high-pass', 'goblin-caverns', 'goblin-caverns'],
    summary: 'The route east climbs through the Misty Mountains, where a storm traps the company on an exposed path and stone-giants hurl rocks across the valley. Fili and Kili find a cave for the travellers and their ponies. Bilbo wakes before goblins seize them through a hidden opening. In the tunnels the Great Goblin recognises Thorin’s sword. Gandalf intervenes, but the escape breaks apart when the pursuers catch up to Dori and Bilbo falls into darkness.',
    events: [
      [[61, 64], 'The party leaves the exposed path and takes shelter in the cave.'],
      [[64, 67], 'The goblins take the company and ponies. The Great Goblin interrogates Thorin.'],
      [[67, 69], 'Gandalf leads the escape. Dori carries Bilbo until he is grabbed from behind.'],
    ],
    remember: [
      [[66, 68], 'The goblins’ names for the two old swords are Biter and Beater.'],
      [[68, 69], 'The company is fleeing together until Bilbo falls and loses consciousness.'],
    ],
    entries: [['stone-giants', 'Stone-giants'], ['great-goblin', 'The Great Goblin'], ['mountain-goblins', 'The Mountain Goblins'], ['high-pass', 'Misty Mountains'], ['goblin-caverns', 'The Goblin Caverns'], ['orcrist', 'Thorin’s Sword'], ['glamdring', 'Gandalf’s Sword'], ['dori', 'Dori']],
  },
  {
    title: 'Riddles in the Dark', pages: [70, 83],
    checkpoints: ['Along the dark passage', 'The riddles and the escape'], focus: ['underground-lake', 'underground-lake', 'underground-lake'],
    summary: 'Bilbo wakes alone, finds a small ring on the floor, and makes his way downhill by the gleam of his dagger. At a subterranean lake, Gollum proposes a riddle contest. Bilbo’s question about his pocket ends the game without resolving how he will leave. When Bilbo discovers that the ring makes him hard to see, he follows Gollum towards the exit. He chooses to spare Gollum and escapes past the guards, leaving buttons behind as he squeezes through the door.',
    events: [
      [[70, 74], 'Bilbo pockets the ring and reaches the water where Gollum lives.'],
      [[74, 78], 'The two exchange riddles. Gollum discovers that his ring is missing.'],
      [[78, 83], 'Bilbo discovers the ring’s effect, finds the way to the exit and leaps past Gollum.'],
    ],
    remember: [
      [[70, 72], 'Bilbo pockets the ring well before he knows what it does. His blade gives him a faint light in the tunnels.'],
      [[80, 83], 'Bilbo’s decision to leap past Gollum is a deliberate act of pity.'],
    ],
    entries: [['gollum', 'Gollum'], ['plain-ring', 'The Plain Ring'], ['lake-boat', 'Gollum’s Boat'], ['bilbo-dagger', 'Bilbo’s Dagger'], ['underground-lake', 'The Underground Lake'], ['bilbo', 'Bilbo Baggins']],
  },
  {
    title: 'Out of the Frying-Pan into the Fire', pages: [84, 95],
    checkpoints: ['Reunited in the foothills', 'Surrounded in the clearing'], focus: ['eastern-slopes', 'wolf-clearing', 'eagles-eyrie'],
    summary: 'Bilbo finds the company on the eastern side of the mountains, slips past Balin and tells them of his escape without mentioning the ring. They descend in haste and find themselves surrounded by wolves. They climb trees as Gandalf throws burning pinecones. Goblins arrive and turn the fire against them. The Lord of the Eagles sees the commotion and brings his followers down. The eagles take the travellers to their eyries and provide a place to rest.',
    events: [
      [[84, 87], 'Bilbo rejoins the company and they hurry down the eastern slopes.'],
      [[87, 92], 'Wolves and goblins gather around the trees. The company is trapped above the flames.'],
      [[92, 95], 'The eagles carry the company out and feed them on the mountain ledges.'],
    ],
    remember: [
      [[84, 86], 'Bilbo keeps the ring secret even as the dwarves revise their opinion of him.'],
      [[94, 95], 'Gandalf and the Lord of the Eagles have met before. The eagles will carry the party away from the mountains.'],
    ],
    entries: [['wargs', 'Wargs'], ['eagle-lord', 'The Lord of the Eagles'], ['eastern-slopes', 'The Eastern Slopes'], ['wolf-clearing', 'The Wolves’ Clearing'], ['burning-trees', 'The Burning Trees'], ['eagles-eyrie', 'The Eagles’ Eyries'], ['pinecones', 'The Burning Pinecones']],
  },
  {
    title: 'Queer Lodgings', pages: [96, 112],
    checkpoints: ['Guests at Beorn’s house', 'North towards the forest'], focus: ['beorn', 'forest-gate', 'forest-gate'],
    summary: 'The eagles set the company on the Carrock, a great rock in the river. Gandalf leads them from there to Beorn’s home and tells their story while introducing the dwarves in small groups. Beorn and his animals give them shelter. After checking their account, he lends them mounts, packs provisions and advises them to take the northern path into Mirkwood. They return the ponies at the forest entrance. Gandalf also takes his leave, and the company sets out along the track.',
    events: [
      [[96, 104], 'The eagles leave the company at the Carrock. Gandalf gains a hearing from Beorn.'],
      [[105, 110], 'Beorn offers food, ponies and a route to the northern forest gate.'],
      [[110, 112], 'The company reaches the gate, returns the ponies, and parts from Gandalf.'],
    ],
    remember: [
      [[98, 105], 'Beorn can take bear form and communicates with the animals of his household.'],
      [[109, 112], 'The company takes the lesser-known northern track after Beorn’s advice. Both Beorn and Gandalf tell them to keep to the path.'],
    ],
    entries: [['carrock', 'The Carrock'], ['great-river', 'The Great River'], ['beorn-character', 'Beorn'], ['beorn-animals', 'Beorn’s Animals'], ['beorn', 'Beorn’s House'], ['honey-cakes', 'Beorn’s Honey-cakes'], ['forest-gate', 'The Forest Gate']],
  },
]

export const chapters: Chapter[] = [
  ...outlines.map(({ title, pages, checkpoints, focus, summary, events, remember, entries }, index): Chapter => {
    const number = index + 1
    return {
      number, title, reveal: at(number), completionEvent: 3,
      milestones: checkpoints.map((label, i) => ({
        id: `checkpoint-${i + 1}`, label, reveal: at(number, i + 1), focus: reference(focus[i], label, number, i + 1),
      })),
      focus: reference(focus[2], title, number, 3),
      recap: {
        ...note(`recap-${number}`, number, 3, pages, summary),
        events: events.map(([range, text], i) => note(`event-${i}`, number, 3, range, text)),
        remember: remember.map(([range, text], i) => note(`remember-${i}`, number, 3, range, text)),
        links: entries.map(([target, label]) => reference(target, label, number, 3)),
      },
    }
  }),
  { number: 8, title: 'Flies and Spiders', reveal: at(8), milestones: [], focus: reference('forest-gate', 'Forest threshold', 8, 0) },
]
