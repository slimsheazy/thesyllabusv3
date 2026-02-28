
// Pythagorean Letter Map
const PYTHAGOREAN_MAP: Record<string, number> = {
  'a': 1, 'j': 1, 's': 1,
  'b': 2, 'k': 2, 't': 2,
  'c': 3, 'l': 3, 'u': 3,
  'd': 4, 'm': 4, 'v': 4,
  'e': 5, 'n': 5, 'w': 5,
  'f': 6, 'o': 6, 'x': 6,
  'g': 7, 'p': 7, 'y': 7,
  'h': 8, 'q': 8, 'z': 8,
  'i': 9, 'r': 9
};

// Chaldean Letter Map (No 9s assigned to letters)
const CHALDEAN_MAP: Record<string, number> = {
  'a': 1, 'i': 1, 'j': 1, 'q': 1, 'y': 1,
  'b': 2, 'k': 2, 'r': 2,
  'c': 3, 'g': 3, 'l': 3, 's': 3,
  'd': 4, 'm': 4, 't': 4,
  'e': 5, 'h': 5, 'n': 5, 'x': 5,
  'u': 6, 'v': 6, 'w': 6,
  'o': 7, 'z': 7,
  'f': 8, 'p': 8
};

// --- Interpretations Database ---

export interface NumberInterpretation {
  direction: string;
  angle: number; // Degrees for compass (0 = North, 90 = East)
  keywords: string[];
  roomType: string;
  height: string;
  containers: string;
  materials: string;
  specificSpots: string[];
  timing: string;
  clues: string;
  icon: string;
}

const INTERPRETATIONS: Record<number, NumberInterpretation> = {
  1: {
    direction: 'East (Front Area)',
    angle: 90,
    keywords: ['High Visibility', 'Main Entrance', 'Morning Sun'],
    roomType: 'Entryway, Front Porch, Foyer',
    height: 'Eye Level / Console Height',
    containers: 'Wall hooks, Key racks, Open surfaces',
    materials: 'Gold, Brass, Polished Metal',
    specificSpots: ['Entry table', 'Mail pile', 'Coat rack', 'Front door mat', 'Sunlit window sill', 'Dashboard of car'],
    timing: 'Dawn / Morning Check',
    clues: 'Look where you first set things down upon entering. It is likely not covered.',
    icon: '🌅'
  },
  2: {
    direction: 'North (Private Area)',
    angle: 0,
    keywords: ['Hidden/Tucked', 'Soft Surfaces', 'Paired Items'],
    roomType: 'Bedroom, Private Den, Bathroom',
    height: 'Low / Below Waist',
    containers: 'Soft bags, Drawers, Pockets, Laundry',
    materials: 'Silver, Fabric, Glass',
    specificSpots: ['Between cushions', 'Under the bed', 'Bedside drawer', 'Inside a pillowcase', 'Bathroom cabinet', 'Laundry hamper'],
    timing: 'Evening / Night Routine',
    clues: 'Search among soft items or tucked into a fold of fabric. It may be obscured by other items.',
    icon: '🌙'
  },
  3: {
    direction: 'Northeast (Social Area)',
    angle: 45,
    keywords: ['Gathering Space', 'Books/Media', 'Active Workspace'],
    roomType: 'Living Room, Common Area',
    height: 'Table Height / Mid-Level',
    containers: 'Shelves, File folders, Tech bags',
    materials: 'Wood, Paper, Plastic',
    specificSpots: ['Coffee table', 'Bookshelf', 'Near a computer/phone', 'Entertainment center', 'Stack of papers', 'Craft area'],
    timing: 'Active Hours / Daytime',
    clues: 'Check areas where you were recently talking or reading. It might be \'filed\' away by accident.',
    icon: '📐'
  },
  4: {
    direction: 'West (Utility Area)',
    angle: 270,
    keywords: ['Grounded/Heavy', 'Storage', 'Maintenance'],
    roomType: 'Office, Garage, Workshop, Basement',
    height: 'Floor Level / Bottom Shelf',
    containers: 'Heavy boxes, Filing cabinets, Toolboxes',
    materials: 'Stone, Iron, Dark Wood',
    specificSpots: ['Bottom drawer', 'Garage workbench', 'Storage bin', 'Room corner', 'Floor near heavy furniture', 'Basement storage'],
    timing: 'Afternoon / Deep Search',
    clues: 'Look in the heavy, stationary parts of the house. It\'s likely in a \'bottom\' position.',
    icon: '🔲'
  },
  5: {
    direction: 'Center (Transit Area)',
    angle: -1,
    keywords: ['Busy Path', 'Temporary Stop', 'Transit'],
    roomType: 'Hallway, Stairs, Center Island',
    height: 'Variable / Quick Access',
    containers: 'Purses, Backpacks, Quick Piles',
    materials: 'Synthetic, Bright, Mixed',
    specificSpots: ['Hallway table', 'Stair landing', 'Car center console', 'Kitchen island', 'Coat pocket', 'Travel bag'],
    timing: 'Midday / Moving Around',
    clues: 'You likely dropped it while moving between rooms. Retrace your steps through the main thoroughfares.',
    icon: '🌪️'
  },
  6: {
    direction: 'Northwest (Service Area)',
    angle: 315,
    keywords: ['Daily Task', 'Cleanliness', 'Nourishment'],
    roomType: 'Kitchen, Dining, Pantry, Laundry Room',
    height: 'Counter Height / Waist Level',
    containers: 'Ceramic bowls, Baskets, Appliance area',
    materials: 'Ceramic, Copper, Stainless Steel',
    specificSpots: ['Kitchen counter', 'Pantry shelf', 'Dining room sideboard', 'Pet area', 'Medicine cabinet', 'Linen closet'],
    timing: 'Evening Prep / Cleaning',
    clues: 'Look near where you do daily chores or prepare food. Check inside decorative containers.',
    icon: '🏠'
  },
  7: {
    direction: 'South (Quiet Area)',
    angle: 180,
    keywords: ['High Storage', 'Insulation', 'Out of Reach'],
    roomType: 'Attic, High Shelf, Private Study',
    height: 'High / Overhead',
    containers: 'Folders, High boxes, Secure safes',
    materials: 'Glass, Mirrors, Paper',
    specificSpots: ['Top of wardrobe', 'Behind a mirror', 'Private desk drawer', 'Attic corner', 'High kitchen cabinets', 'Inside a box'],
    timing: 'Night / Stillness',
    clues: 'It is likely high up or tucked behind something used for deep storage. Check vertical spaces.',
    icon: '🕯️'
  },
  8: {
    direction: 'Southeast (Valuable Area)',
    angle: 135,
    keywords: ['Orderly', 'Financial', 'Structured Storage'],
    roomType: 'Office, Walk-in Closet, Safe room',
    height: 'Organized / Mid-High',
    containers: 'Wallets, Briefcases, Jewelry boxes',
    materials: 'Leather, Fabric, Valuables',
    specificSpots: ['Safe', 'Wallet/Purse', 'Office desk', 'Walk-in closet', 'Near financial docs', 'Inside a jacket pocket'],
    timing: 'Working Hours / Morning',
    clues: 'Check among items of value or where you keep important documents. It is in an organized spot.',
    icon: '💼'
  },
  9: {
    direction: 'Southwest (Boundary Area)',
    angle: 225,
    keywords: ['Discarded', 'Boundary', 'Exterior/Garden'],
    roomType: 'Mudroom, Back Porch, Storage, Yard',
    height: 'Floor Level / Outer Edge',
    containers: 'Baskets, Trash bins, Outdoor bins',
    materials: 'Earthy, Recycled, Canvas',
    specificSpots: ['Recycling bin', 'Junk drawer', 'Near the back door', 'Garden area', 'Outdoor shed', 'Laundry room floor'],
    timing: 'Twilight / End of Day',
    clues: 'Check the \'exit\' points of your home or areas where items are set aside to be thrown out.',
    icon: '🏁'
  }
};

// --- Logic Helpers ---

const fadicReduce = (num: number): number => {
  if (num === 0) {
    return 0;
  }
  if (num % 9 === 0) {
    return 9;
  }
  return num % 9;
};

const stringToNumber = (str: string, map: Record<string, number>): number => {
  const clean = str.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  for (const char of clean) {
    sum += map[char] || 0;
  }
  return fadicReduce(sum);
};

const dateToNumber = (dateString: string): number => {
  const digits = dateString.replace(/[^0-9]/g, '').split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return fadicReduce(sum);
};

// --- Main Calculator ---

export interface CalculationResult {
  itemNumber: number;
  dateNumber: number;
  seekerNumber: number;
  masterNumber: number;
  interpretation: NumberInterpretation;
  breakdown: {
    itemSum: number;
    dateSum: number;
    seekerSum: number;
    totalSum: number;
  }
}

export const calculateLostItem = (
  itemName: string,
  dateLost: string,
  seekerName: string,
  system: 'pythagorean' | 'chaldean' = 'pythagorean'
): CalculationResult => {
  const map = system === 'chaldean' ? CHALDEAN_MAP : PYTHAGOREAN_MAP;

  const itemNumber = stringToNumber(itemName, map);
  const dateNumber = dateToNumber(dateLost);
  const seekerNumber = seekerName ? stringToNumber(seekerName, map) : 0;

  const masterRaw = itemNumber + dateNumber + seekerNumber;
  const masterNumber = fadicReduce(masterRaw);

  return {
    itemNumber,
    dateNumber,
    seekerNumber,
    masterNumber,
    interpretation: INTERPRETATIONS[masterNumber],
    breakdown: {
      itemSum: itemNumber,
      dateSum: dateNumber,
      seekerSum: seekerNumber,
      totalSum: masterRaw
    }
  };
};
