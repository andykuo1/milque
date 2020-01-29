import { SceneBase, Utils } from './milque.js';
import { Camera2D } from './util/Camera2D.js';
import * as Camera2DControls from './controls/Camera2DControls.js';
import * as CameraHelper from './util/CameraHelper.js';
import { TileMap } from './tile/TileMap.js';
import { TileSet } from './tile/TileSet.js';

export class MainScene extends SceneBase
{
    /** @override */
    async load()
    {
        this.tileSheet = await loadTileSheet('../res/dungeon.png', '../res/dungeon.tiles');
    }

    /** @override */
    onStart()
    {
        this.camera = new Camera2D();

        this.tileSet = new TileSet();
        this.tileSet.add('grass');
        this.tileSet.add('stone');

        this.tileMap = new TileMap(16, 16);
        this.tileMap.fill(1);
    }

    /** @override */
    onUpdate(dt)
    {
        Camera2DControls.doCameraMove(this.camera);
    }

    onRender(ctx, view, world)
    {
        Utils.drawText(ctx, Math.round(world.camera.transform.x), 20, 100);
        Utils.drawText(ctx, Math.round(world.camera.transform.y), 20, 120);
        Utils.drawText(ctx, Math.round(world.camera.transform.scaleX * 10) / 10, 20, 140);
        Utils.drawText(ctx, Math.round(world.camera.transform.scaleY * 10) / 10, 20, 160);

        CameraHelper.drawWorldGrid(ctx, view, world.camera);
        Camera2D.applyTransform(ctx, world.camera, view.width / 2, view.height / 2);
        {
            renderTiles(ctx, world.tileMap);
        }
        Camera2D.resetTransform(ctx);
        CameraHelper.drawWorldTransformGizmo(ctx, view, world.camera);
    }
}

function renderTiles(ctx, tileMap, offsetX = 0, offsetY = 0, tileWidth = 16, tileHeight = 16)
{
    for(let x = 0; x < tileMap.width; ++x)
    {
        for(let y = 0; y < tileMap.height; ++y)
        {
            renderTile(ctx, tileMap.get(x, y), offsetX + x * tileWidth, offsetY + y * tileHeight, tileWidth, tileHeight);
        }
    }
}

function renderTile(ctx, tileValue, offsetX = 0, offsetY = 0, width = 16, height = 16)
{
    switch(tileValue)
    {
        case 0:
            break;
        case 1:
            ctx.fillStyle = 'green';
            ctx.fillRect(offsetX, offsetY, width, height);
            break;
        case 2:
            ctx.fillStyle = 'dodgerblue';
            ctx.fillRect(offsetX, offsetY, width, height);
            break;
    }
}

async function loadTileSheet(sheetUrl, tileUrl)
{
    let dst = {};

    let img = new Image();
    img.src = sheetUrl;

    let data = await fetch(tileUrl);
    let stringData = await data.text();
    for(let line of stringData.split('\n'))
    {
        line = line.trim();
        if (line <= 0) continue;

        let args = [];
        let i = 0;
        let j = line.indexOf(' ');
        while(j >= 0)
        {
            args.push(line.substring(i, j));
            i = j + 1;
            j = line.indexOf(' ', i);
        }
        args.push(line.substring(i));

        let name = args[0];
        let u = Number.parseInt(args[1]);
        let v = Number.parseInt(args[2]);
        let w = Number.parseInt(args[3]);
        let h = Number.parseInt(args[4]);
        let frames = args.length >= 6 ? Number.parseInt(args[5]) : 1;

        dst[name] = {
            source: img,
            u, v,
            w, h,
            frames,
            name,
        };
    }

    return dst;
}
