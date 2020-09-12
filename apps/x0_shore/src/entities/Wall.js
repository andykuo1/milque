import { GameObject } from './GameObject.js';
import { World } from '../World.js';

export class Wall extends GameObject
{
    constructor(left = 0, top = 0, right = left + 10, bottom = top + 10)
    {
        super();

        const width = right - left;
        const height = bottom - top;
        const rx = width / 2;
        const ry = height / 2;
        const x = left + rx;
        const y = top + ry;

        const { assets } = World.getWorld();
        this.add('Transform', { x, y });
        this.add('Renderable', { renderType: 'sprite' });
        this.add('Sprite', {
            textureStrip: assets.dungeon.getSubTexture('wall_mid'),
        });
        this.add('Collidable', { masks: { main: { x, y, rx, ry } } });
        this.add('Solid', { masks: ['main']});
    }
}
