# CS 4280 Maze Game

A WebGL maze you roll a basketball through: find the tower in the northwest corner of a 3D town, without running into the walls.

This is my portfolio copy of a partner final project for CS 4280 Computer Graphics at Weber State University, Spring 2024. The [original repository](https://github.com/NickILStep/CS4280-FinalProject) is public and licensed under MIT.

**Demo:** [pheonox71.github.io/CS4280-FinalProject](https://pheonox71.github.io/CS4280-FinalProject/)

<!-- TODO: add a short demo GIF or screenshots of the basketball in the town maze, the water floor, and the northwest tower once they are captured. -->

## Gameplay and controls

- **Goal.** Roll the ball to the tower in the northwest corner of the map. An alert on load states the objective; reaching a position threshold (`x < -14.75` and `z < -8`) shows a "You Win!" alert and stops movement.
- **Controls.** WASD moves the ball on the XZ plane (W/S along Z, A/D along X). Keys can be held and combined for diagonal movement. Opposite keys on the same axis cancel out.
- **Camera.** A perspective camera sits a fixed height above the ball and looks at it each frame, so it follows as you roll.
- **Collision.** Before the ball moves, a short `THREE.Raycaster` is fired along the intended direction against the maze mesh. A hit blocks that move so you cannot pass through walls.

There is no procedural maze generator and no physics engine. The town is a pre-built OBJ/MTL model that I designed in [Townscaper](https://www.townscapergame.com/) and exported, movement is a constant speed translation, and the basketball's spin is a visual rotation applied after a successful move.

## Graphics techniques

All of this is implemented with THREE.js (r120) on a `WebGLRenderer`, not with hand-written GLSL. `src/shaders/` is an empty starter folder.

- **Materials and lighting.** The ball and a large ground plane use `MeshPhongMaterial`. The scene has a single `AmbientLight` (white, intensity 0.9). There are no directional or point lights.
- **Textures.** A basketball color map is applied to the sphere. The ground plane uses a painted water texture (`waterPaint.jpg`).
- **Animated water.** A larger `THREE.Water` plane (the Water2 example object) sits just above the ground, with two normal maps, a flow direction, and 1024×1024 water textures.
- **Town maze.** The maze is loaded at runtime with `MTLLoader` and `OBJLoader` from `./models/Town.mtl` and `./models/MazeTown1.obj.js` (the color map is `TownColor.png`). The source files are `src/models/`; the build copies them to `dist/models/`. The model is still the Townscaper OBJ. The `.js` suffix lets GitHub Pages gzip it; a `.obj` URL is served as `application/x-tgif` and is not compressed.
- **Camera follow.** Each frame the camera is placed at `(ball.x, ball.y + 10, ball.z)` and aimed at the ball. `OrbitControls` is still created and updated, but that follow pose overwrites it.
- **Rolling animation.** After a move is accepted, the ball is rotated on world axes (`rotateOnWorldAxis`) so it appears to roll in the direction of travel.

## Tech stack

| Layer | Choice |
| --- | --- |
| Rendering | THREE.js `^0.120.1` (`WebGLRenderer`, `OBJLoader` / `MTLLoader`, `Water` from `three/examples`) |
| Language | JavaScript (ES modules, Babel `@babel/preset-env`) |
| Bundler / dev server | Webpack 4, webpack-dev-server (port 8080) |
| Styles | SCSS (`main.scss`) compiled through `sass-loader` / `sass` (Dart Sass) |
| Deployment | Static webpack output in `dist/`, served on GitHub Pages from the repo root via a redirect |

`package.json` also lists `d3` and `dat.gui`. Neither is imported in the current game code (`dat.gui` was imported early and later removed).

## Architecture

```
├── index.html                 # GitHub Pages redirect to dist/index.html
├── webpack.config.js          # entry: src/javascripts/main.js; output: dist/
├── scripts/webpack.js         # Node 17+: adds --openssl-legacy-provider for Webpack 4
├── src/
│   ├── index.html             # page chrome, WebGL canvas, student names
│   ├── javascripts/
│   │   ├── main.js            # the game (scene, input, collision, water)
│   │   └── webgl_helper.js    # unused course-starter WebGL2 helper
│   ├── stylesheets/main.scss
│   ├── images/                # basketball, water textures, WebGL logo
│   ├── models/                # MazeTown1.obj.js, Town.mtl, TownColor.png
│   └── shaders/               # empty (.keep only)
└── dist/                      # production webpack build, committed for GitHub Pages
    └── models/                # copied from src/models/ by the build
```

Almost all game logic lives in `src/javascripts/main.js`. Webpack copies HTML, images, and styles into `dist/`. `file-loader` does not emit `.obj` / `.mtl`, so `webpack.config.js` copies `src/models/` to `dist/models/` on every build. The loaders request those files from `./models/` at runtime. `dist/` stays in git so GitHub Pages can serve the production bundle and the maze without a separate CI job.

## My contributions

I contributed as [chancehardmanweber](https://github.com/chancehardmanweber) (13 commits, April 2024). My main GitHub account is [pheonox71](https://github.com/pheonox71). The work below is limited to what those commits show. Nicholas Stephenson (Nick) built substantial parts of the game as well, including the working maze load, the first playable WASD movement, camera follow, and the win condition (see Credits).

**Town design.** I built the 3D town that serves as the maze in Townscaper, then exported it as the OBJ/MTL model the game loads.

**Loader setup.** I added the `OBJLoader` / `MTLLoader` imports and the first attempts to load the town model, then fixed constructor and import errors. The paths I used (`src/objects/`, `src/textures`) did not load in the bundled page; Nick later pointed the loaders at `./models/` and got the maze into the scene.

- [added in the object code I have](https://github.com/NickILStep/CS4280-FinalProject/commit/c2723e69f04f75dc62a70d08ae19fa6f11f2302c)
- [fixed import error](https://github.com/NickILStep/CS4280-FinalProject/commit/7745e47ce2d8424660398cbb9c511ba0c37f1350)
- [chances to loaders](https://github.com/NickILStep/CS4280-FinalProject/commit/c8e438b6941a850ec3ecf013be7526301924cc65)

**Movement and collision.** I started with roll-movement pseudocode and an early WASD attempt (that version moved on the wrong axes). After Nick landed hold-to-press translation, camera follow, and the win alert, I switched input to a key map so you can hold WASD and move continuously, shrank the ball to fit the maze, and added raycaster collision against the named maze object. I also extracted `updateCamera()`, tightened the win-position threshold, and stopped the ball after a win.

- [added ball roll pseudocode](https://github.com/NickILStep/CS4280-FinalProject/commit/e81733940e9a2ae5c6e68a2923bcff6260e6c453)
- [maybe implemented ball movement](https://github.com/NickILStep/CS4280-FinalProject/commit/83c98fbec3ef44e5908e0d12a7460002ddaa3534)
- [got it running and improved movement](https://github.com/NickILStep/CS4280-FinalProject/commit/6c98527671bad790d42f7e445acd8873ea43e5a4)
- [it works now](https://github.com/NickILStep/CS4280-FinalProject/commit/ba97c50ab821fd03256fa289a353814306bbea92)

**Water, basketball texture, and roll animation.** I replaced Nick's solid blue floor with a painted water texture, added the Water2 plane and normal maps, and nudged the water height so it sits on the ground. I applied a basketball texture to the sphere and added world-axis rotation so the ball rolls as it moves. A later commit added section comments and mentioned WASD in the instructions alert.

- [we now have water](https://github.com/NickILStep/CS4280-FinalProject/commit/6b67c4787ebdbd18a311e4e4b7237510d141071f)
- [fixed water position](https://github.com/NickILStep/CS4280-FinalProject/commit/35209bd8bc567ca8af43ed1bae992c37b1e9fe46)
- [ball is now basketball](https://github.com/NickILStep/CS4280-FinalProject/commit/9d3d0e5266161cf59cc91296fd4346ffa6f7510a)
- [added in ball rotation](https://github.com/NickILStep/CS4280-FinalProject/commit/fc8fb7503146f36fea85ecbebf3036069cc3f678)

## Credits

- [Chance Brenchley](https://github.com/chancehardmanweber) (`chancehardmanweber`; main GitHub: [pheonox71](https://github.com/pheonox71)) — me. Git commits and the in-page credit string still use the former name Chance Hardman.
- [Nicholas Stephenson](https://github.com/NickStepWeber) (`NickStepWeber`; this public copy is under [NickILStep](https://github.com/NickILStep)) — committed the town maze OBJ/MTL assets, got the maze loading, added the ball mesh, the first playable WASD movement, camera follow, and the win condition, added the original blue ground plane and canvas layout resize, and enabled GitHub Pages (root redirect plus the `dist/` build).

The project started from Prof. Abdulmalek Al-Gahmi's [CS 4280 webpack starter](https://github.com/WSU-FALL-2020/cs4280-inclass).

## Running locally

**Scripts** (from `package.json`): `npm start` runs `webpack-dev-server` (content base `dist/`, port 8080). `npm run deploy` runs `webpack` in production mode and writes the bundle into `dist/`, including a copy of `src/models/`.

**Node version:** This copy was installed and built with Node 22. The course starter targeted Node 12.20.0 because the project depended on `node-sass@^4.14.1`, which does not build on current Node. That dependency is replaced here with the `sass` package (Dart Sass 1.77.8, which still exposes the render API `sass-loader` 7 expects). Webpack 4 also calls the `md4` hash. Node 17+ disables `md4` unless the process is started with `--openssl-legacy-provider`, so `scripts/webpack.js` adds that flag before `npm start` and `npm run deploy`.

1. Clone this repository.
2. Install dependencies and start the dev server. The build copies `src/models/` (`Town.mtl`, `MazeTown1.obj.js`, `TownColor.png`) into `dist/models/`.

```bash
npm install
npm start
```

3. Open [http://localhost:8080/](http://localhost:8080/) (Chrome or Firefox recommended).

To rebuild the static site into `dist/`:

```bash
npm run deploy
```

GitHub Pages serves this repository from the `main` branch, folder `/ (root)`. `index.html` redirects to `dist/index.html`. `npm run deploy` writes a production bundle (no inline source maps) and refreshes `dist/models/` from `src/models/`. Commit that `dist/` output with the redirect; Pages has no `/dist` folder option, only `/ (root)` and `/docs`.

## Course

CS 4280 Computer Graphics, Weber State University, Spring 2024. Partner project with Nicholas Stephenson.

## License

This project is licensed under the [MIT License](LICENSE), the same license as the [original repository](https://github.com/NickILStep/CS4280-FinalProject). The license text still carries the course starter's copyright line (`Copyright (c) 2019 WSU-SUMMER-2019`).
