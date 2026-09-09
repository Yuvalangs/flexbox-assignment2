# 🍔 Flex Burger Kitchen

A small browser game that teaches **CSS Flexbox** from scratch. You are the line cook: every order ticket
asks you to plate burger ingredients onto their target plates, and the only tools you have are the four
core flex-container properties.

Built with plain **HTML5, CSS3 and vanilla JavaScript** — no frameworks, no libraries, no build step.

## How to play

1. Read the order ticket on the right. It tells you where the ingredients have to end up.
2. Change the unlocked properties in the `.prep-line { … }` panel. The prep board updates instantly —
   the ingredients you see are real flex items inside a real `display: flex` container.
3. Line every ingredient up with its dashed target plate and press **🔔 Serve Order**.
4. Nailed it? You get an *Order Complete!* badge and the next ticket. Otherwise the board shakes, stray
   ingredients flash, and you can try again. **↺ Reset Order** puts the ticket back to its starting recipe.

Use **◀ Prev / Next ▶**, the numbered badges in the header, or the ← / → arrow keys to revisit any order.
Completed orders are remembered in `localStorage`, and the attempts counter tracks how many serves each
order took in the current session.

## The orders

| # | Ticket                     | Teaches                                                              |
|---|----------------------------|----------------------------------------------------------------------|
| 1 | Patties on the grill       | `justify-content`                                                    |
| 2 | Toppings on the bottom bun | `align-items`                                                        |
| 3 | Cheese dead centre         | `justify-content` + `align-items`                                    |
| 4 | Build the tower            | `flex-direction` (+ `align-items`)                                   |
| 5 | Slider party tray          | `flex-wrap` (+ `justify-content`)                                    |
| 6 | Double stack, side by side | `flex-direction` + `flex-wrap` + `justify-content` + `align-items`   |

## How it works

* The prep board is a fixed **600 × 400 px** container so every layout calculation is deterministic.
  On narrow screens the whole board is scaled down with a CSS `transform`, which does not affect the
  underlying layout coordinates.
* Two identical flex containers are stacked on the board: a **target layer** whose children are plates
  laid out with the order's solution, and a **player layer** whose children are the ingredients laid out
  with whatever the player picks.
* Every `<select>` writes its value straight onto the player container's inline style, so changes are live.
* Serving an order compares the `offsetLeft / offsetTop / offsetWidth / offsetHeight` of each ingredient
  with its plate. If every pair matches (within 1 px) the order is complete — so any combination of values
  that produces the same layout is accepted, exactly like real CSS.
* Levels live in `js/levels.js`; adding an order is a matter of appending one object to the `LEVELS` array.

```
index.html      page structure: board, ticket, controls
css/style.css   kitchen theme, CSS-drawn ingredients, win effects, responsive shell
js/levels.js    the six orders (ingredients, unlocked controls, initial + solution values)
js/game.js      rendering, live property binding, validation, navigation, progress
```

No CSS Grid is used anywhere on the game board.

## Running locally

Just open `index.html` in a browser. Everything runs client-side.

If you prefer a local server (avoids `file://` quirks in some browsers):

```bash
python -m http.server 8000
```

then visit <http://localhost:8000>.

## Deploying to GitHub Pages

The site is static and `index.html` sits at the repository root, so no build configuration is required.

1. Push the repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick the branch (e.g. `main`) and the
   `/ (root)` folder, then save.
4. After a minute the game is live at `https://<username>.github.io/<repository>/`.

All asset paths are relative (`css/style.css`, `js/game.js`), so it works both at the domain root and under a
project sub-path.

## Team

* **Kfir Meir** — layout & prep board, level data and flex bindings, win effects and docs
* **Yuval** — ingredient styles and counter theme, order validation and level switching
