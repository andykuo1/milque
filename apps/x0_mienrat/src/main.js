import '@milque/display';
import '@milque/input';
import { MainMenuState } from './MainMenuState';

import * as OpenSimplexNoise from 'open-simplex-noise';

window.addEventListener('DOMContentLoaded', main);
window.addEventListener('unhandledrejection', error, true);
window.addEventListener('error', error, true);

function error(e)
{
    if (e instanceof PromiseRejectionEvent)
    {
        window.alert(e.reason.stack);
    }
    else if (e instanceof ErrorEvent)
    {
        window.alert(e.error.stack);
    }
    else
    {
        window.alert(JSON.stringify(e));
    }
}

const DISPLAY_WIDTH = 320;
const DISPLAY_HEIGHT = 240;
const INPUT_MAP = {
    MoveLeft: [ 'Keyboard:ArrowLeft', 'Keyboard:KeyA' ],
    MoveRight: [ 'Keyboard:ArrowRight', 'Keyboard:KeyD' ],
    MoveUp: [ 'Keyboard:ArrowUp', 'Keyboard:KeyW' ],
    MoveDown: [ 'Keyboard:ArrowDown', 'Keyboard:KeyS' ],
    Evade: { key: 'Keyboard:Space', event: 'down' },
    Interact: { key: 'Keyboard:KeyE', event: 'down' },
    Interacting: 'Keyboard:KeyE'
};

const HALF_PI = Math.PI / 2;
const FOURTH_PI = Math.PI / 4;
const TWO_PI = Math.PI * 2;

async function main()
{
    /** @type {import('@milque/display').DisplayPort} */
    const display = document.querySelector('#display');
    display.width = DISPLAY_WIDTH;
    display.height = DISPLAY_HEIGHT;

    /** @type {import('@milque/input').InputPort} */
    const input = document.querySelector('#input');
    input.src = INPUT_MAP;

    const ctx = display.canvas.getContext('2d');

    let world = {
        started: false,
        running: false,
        display,
        input,
        ctx,
        frames: 0,
        tickTime: 0,
        ticks: 0,
    };

    world.running = true;
    display.addEventListener('frame', e => {
        if (world.running)
        {
            if (!world.started)
            {
                world.started = true;
                initialize(world);
            }
            else
            {
                const dt = e.detail.deltaTime;
                world.tickTime += dt;
                while(world.tickTime >= 0)
                {
                    world.tickTime -= 1;
                    tick(world);
                }
        
                update(world);
                render(world);
            }
        }
        else
        {
            if (world.started)
            {
                world.started = false;
                destroy(world);
            }
        }
    });
}

function initialize(world)
{
    let state = new MainMenuState();
    world.mainMenu = state;
    world.currentState = state;
}

function destroy(world) {}

function tick(world)
{
    ++world.ticks;
    world.input.source.poll();
    world.currentState.tick(world);
}

function update(world)
{
    world.currentState.update(world);
}

function render(world)
{
    ++world.frames;
    world.currentState.render(world);
}
