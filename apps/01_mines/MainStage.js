import * as PlayerControls from './PlayerControls.js';
import * as MainScene from './MainScene.js';
import * as MainRender from './MainRender.js';

/*

What is good in Minesweeper?
- Inherant scaling difficulty as the game progresses (less tiles)
- Clean ruleset
    - Deductive reasoning and arithmetic (best forms of logic for play)
- Replay value (randomized maps)
- Pure form

deterministic, mostly.
High risk / High reward? (sadly, only high risk)

What is bad in minesweeper?
- Doesn't have a progression Curve.
- Don't have low risk options.
- DONT LIKE TIMED TASKS!!!
    - Hard ceiling
- CANNOT BE IMPOSSIBLE TO WIN

*/

export async function load()
{
    PlayerControls.PLAYER_INPUT_CONTEXT.attach(document, this.display.canvas);

    await MainRender.load.call(this);
}

export function start()
{
    MainScene.onStart.call(this);
}

export function update(dt)
{
    MainScene.onPreUpdate.call(this, dt);

    PlayerControls.PLAYER_INPUT_CONTEXT.poll();

    MainScene.onUpdate.call(this, dt);
}

export function render(ctx)
{
    const view = {
        context: ctx,
        width: this.display.width,
        height: this.display.height,
    };
    MainRender.onRender.call(this, view, this);
}
