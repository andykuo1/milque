import { Random } from '@milque/random';

/**
 * What I learned:
 * - I need access to the current bound canvas, wherever this object
 * is being used.
 * - I should implement all things related to Starfield in here and
 * just expose an interface for the engine to connect to.
 */

const STAR_SIZE_RANGE = [2, 4];
const STAR_SPEED_RANGE = [0.3, 1];
const STAR_PARTICLE_COUNT = 30;

export function createStarfield(width, height)
{
    let result = {
        x: [],
        y: [],
        size: [],
        speed: [],
        length: 0,
        width,
        height,
    };
    for(let i = 0; i < STAR_PARTICLE_COUNT; ++i)
    {
        result.x.push(Random.range(0, width));
        result.y.push(Random.range(0, height));
        result.size.push(Random.range(...STAR_SIZE_RANGE));
        result.speed.push(Random.range(...STAR_SPEED_RANGE));
        result.length++;
    }
    return result;
}

export function renderStarfield(ctx, starfield, color = 'white')
{
    for(let i = 0; i < starfield.length; ++i)
    {
        let x = starfield.x[i];
        let y = starfield.y[i];
        let size = starfield.size[i];

        let halfSize = size / 2;
        ctx.fillStyle = color;
        ctx.fillRect(x - halfSize, y - halfSize, size, size);
    }
}

export function updateStarfield(starfield, dx = 1, dy = 0)
{
    const { length, width, height } = starfield;
    
    for(let i = 0; i < length; ++i)
    {
        let ddx = dx * starfield.speed[i];
        let ddy = dy * starfield.speed[i];
        
        starfield.x[i] += ddx;
        starfield.y[i] += ddy;

        if (ddx < 0)
        {
            if (starfield.x[i] < 0)
            {
                starfield.x[i] = width;
                starfield.y[i] = Random.range(0, height);
            }
        }
        else if (ddx > 0)
        {
            if (starfield.x[i] > width)
            {
                starfield.x[i] = 0;
                starfield.y[i] = Random.range(0, height);
            }
        }

        if (ddy < 0)
        {
            if (starfield.y[i] < 0)
            {
                starfield.x[i] = Random.range(0, width);
                starfield.y[i] = height;
            }
        }
        else if (ddy > 0)
        {
            if (starfield.y[i] > height)
            {
                starfield.x[i] = Random.range(0, width);
                starfield.y[i] = 0;
            }
        }
    }
}
