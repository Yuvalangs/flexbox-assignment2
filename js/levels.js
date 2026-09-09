/* ==========================================================================
   Flex Burger Kitchen — order (level) definitions
   Each order describes:
     - ingredients : items rendered into the player flex container (DOM order)
     - controls    : which flex properties the player may change on this order
     - initial     : starting values for all four properties
     - solution    : the values that plate the order correctly (merged over initial
                     to lay out the target plates)
   ========================================================================== */

const FLEX_PROPS = ['flex-direction', 'justify-content', 'align-items', 'flex-wrap'];

const DEFAULTS = {
  'flex-direction': 'row',
  'justify-content': 'flex-start',
  'align-items': 'flex-start',
  'flex-wrap': 'nowrap'
};

const LEVELS = [
  {
    id: 1,
    title: 'Patties on the grill',
    meta: 'Table 4',
    order: 'Three patties just hit the flat-top, but they are all bunched up on the left. Slide them into the middle of the grill so they cook evenly.',
    hint: '<code>justify-content</code> positions items along the <em>main axis</em> (left &rarr; right for a row). <code>center</code> pulls everything into the middle.',
    ingredients: ['patty', 'patty', 'patty'],
    controls: ['justify-content'],
    initial: { ...DEFAULTS },
    solution: { 'justify-content': 'center' }
  },
  {
    id: 2,
    title: 'Toppings on the bottom bun',
    meta: 'Table 7',
    order: 'Lettuce, tomato and cheese are floating at the top of the prep board. Drop every topping down so it rests on the bottom bun.',
    hint: '<code>align-items</code> positions items along the <em>cross axis</em> (top &darr; bottom for a row). <code>flex-end</code> sends them to the far edge.',
    ingredients: ['lettuce', 'tomato', 'cheese'],
    controls: ['align-items'],
    initial: { ...DEFAULTS },
    solution: { 'align-items': 'flex-end' }
  },
  {
    id: 3,
    title: 'Cheese dead centre',
    meta: 'Takeaway',
    order: 'The regular wants their patty, cheese and tomato stacked right in the heart of the board. Centre the whole line both across and down.',
    hint: 'Combine both axes: <code>justify-content: center</code> for left/right and <code>align-items: center</code> for up/down.',
    ingredients: ['patty', 'cheese', 'tomato'],
    controls: ['justify-content', 'align-items'],
    initial: { ...DEFAULTS },
    solution: { 'justify-content': 'center', 'align-items': 'center' }
  },
  {
    id: 4,
    title: 'Build the tower',
    meta: 'Table 2',
    order: 'This order is falling off the counter! Stack the burger as a tower standing in the middle of the board: bottom bun on the counter, top bun on top.',
    hint: 'Change the main axis with <code>flex-direction</code>. The bottom bun is first in the list, so <code>column-reverse</code> puts it at the bottom. Then centre the tower with <code>align-items</code>.',
    ingredients: ['bun-bottom', 'patty', 'cheese', 'lettuce', 'bun-top'],
    controls: ['flex-direction', 'align-items'],
    initial: { ...DEFAULTS },
    solution: { 'flex-direction': 'column-reverse', 'align-items': 'center' }
  },
  {
    id: 5,
    title: 'Slider party tray',
    meta: 'Party of 12',
    order: 'Eight sliders will not fit on one row and are spilling off the tray. Let them flow onto a second row and keep each row centred.',
    hint: 'By default a flex line never breaks. <code>flex-wrap: wrap</code> lets items overflow onto a new line, and <code>justify-content</code> still applies to every line.',
    ingredients: ['slider', 'slider', 'slider', 'slider', 'slider', 'slider', 'slider', 'slider'],
    controls: ['flex-wrap', 'justify-content'],
    initial: { ...DEFAULTS },
    solution: { 'flex-wrap': 'wrap', 'justify-content': 'center' }
  },
  {
    id: 6,
    title: 'Double stack, side by side',
    meta: 'Rush hour',
    order: 'Two full burgers, one ticket. Build both as vertical stacks (bottom bun down, top bun up), let the second burger wrap into its own column, and centre everything on the board.',
    hint: 'You need all four properties: <code>flex-direction: column-reverse</code> to stack bottom-up, <code>flex-wrap: wrap</code> for a second column, then <code>justify-content</code> and <code>align-items</code> to centre each stack.',
    ingredients: ['bun-bottom', 'patty', 'cheese', 'bun-top', 'bun-bottom', 'patty', 'cheese', 'bun-top'],
    size: 'lg',
    controls: ['flex-direction', 'flex-wrap', 'justify-content', 'align-items'],
    initial: { ...DEFAULTS },
    solution: {
      'flex-direction': 'column-reverse',
      'flex-wrap': 'wrap',
      'justify-content': 'center',
      'align-items': 'center'
    }
  }
];

const INGREDIENT_LABELS = {
  'patty': 'Beef patty',
  'cheese': 'Cheese slice',
  'lettuce': 'Lettuce',
  'tomato': 'Tomato slice',
  'bun-top': 'Top bun',
  'bun-bottom': 'Bottom bun',
  'slider': 'Mini slider'
};
