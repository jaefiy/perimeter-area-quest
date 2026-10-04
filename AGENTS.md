# Project rules for Perimeter and Area Quest
- Static website only: HTML, CSS, vanilla JavaScript. No frameworks, no build step, no external CDN or API calls (must work offline and on Vercel).
- Audience: Year 5 Malaysian primary school students (KSSR Mathematics, Space 6.3.1 and 6.3.2).
- All on-screen text in simple, short English (CEFR A2-B1). Max 15 words per instruction.
- Visual style: bright, colourful, game-like, rounded corners, large buttons (min 48px), friendly emoji/SVG icons, smooth but short animations. Colour code: BLUE = perimeter, GREEN = area, RED = shared side, YELLOW = hints/stars.
- Must work on phone, tablet and laptop; support both touch and mouse (use Pointer Events).
- Accessibility: font size >= 18px for body text, contrast ratio >= 4.5:1, never rely on colour alone (add labels/icons).
- MATH RULES (never break these):
  1. Perimeter of a composite shape = sum of the OUTER sides only. Shared (joined) sides are NOT counted.
     Formula: P = P1 + P2 - 2 x (shared length).
  2. Area of a composite shape = Area1 + Area2 (shapes must not overlap).
  3. Area of rectangle = length x width. Square = side x side. Triangle = 1/2 x base x height.
  4. Units: cm, cm2, m, m2. Always show the unit.
- Put all shared math functions in js/mathcore.js and reuse them everywhere. Do not duplicate formulas.
- Add tests in tests/ (plain Node, no libraries, run with `node tests/<file>.test.js`). Every task must keep all tests passing.
- Comment the code clearly so teacher trainees can read it.
- Do not use copyrighted images, fonts, sounds or characters. Use only inline SVG, CSS, emoji and original shapes.
  5. Curriculum scope (follow strictly):
     - Perimeter of composite shapes (6.3.1): two shapes joined along a shared side. Allowed shapes: regular polygons up to 8 sides (equilateral triangle, square, regular pentagon, hexagon, heptagon, octagon), plus right-angled triangle, isosceles triangle and rectangle.
     - Area of composite shapes (6.3.2): two shapes only, from: rectangle, square, equilateral triangle, isosceles triangle, right-angled triangle. Area of pentagon, hexagon, heptagon and octagon is NOT in Year 5 and must never be asked or calculated.
     - Shared sides may be horizontal, vertical or sloped, as long as the two edges match.
     - For an equilateral triangle, the height is given as data (side 4 cm: height 3.5 cm; side 8 cm: height 7 cm). Area = 1/2 x base x height using the given height.
