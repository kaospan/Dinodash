# Dinodash

Dinodash is the 3D evolution of Phoneage: a miniature mechanical-diorama puzzle game built around readable spatial levels, variable block heights, and a future Z-axis puzzle system.

## Architecture

Dinodash keeps the classic Phoneage 20×11 format intact while adding a separate 3D level format.

### 3D roadmap

- 7×7 standard boards
- 5×5 tutorials, 6×6 easy, 8×8 difficult, 9×9 expert
- Variable heights 1–3 initially
- Orthographic miniature-diorama camera
- Height-aware climbing, descending and falling
- Phoneage movement mechanics adapted vertically
- Dedicated `Level3D` data model
- 2D/3D level editor
- 10 experimental levels before campaign conversion
- Height-aware solver only after movement rules are stable

The first milestone is a genuinely fun, small 7×7 3D puzzle without breaking the classic game.
