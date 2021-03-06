export async function loadAtlas(src)
{
    if (typeof src === 'string')
    {
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        return loadAtlas(arrayBuffer);
    }
    else if (!(src instanceof ArrayBuffer || ArrayBuffer.isView(src)))
    {
        throw new Error(
            'Cannot load from source - must be '
            + 'an array buffer or fetchable url');
    }
    /** @type {ArrayBuffer} */
    const arrayBuffer = src;
    const string = new TextDecoder().decode(arrayBuffer);
    let result = {};
    for(let line of string.split('\n'))
    {
        line = line.trim();
        if (line <= 0) continue;
        if (line.startsWith('#')) continue;
        if (line.startsWith('//')) continue;

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
        let frames = args.length >= 6
            ? Number.parseInt(args[5])  // User-defined
            : 1;                        // Default 1 frame
        let cols = args.length >= 7
            ? Number.parseInt(args[6])  // User-defined
            : frames;                   // Default same as frame count
        let rows = args.length >= 8
            ? Number.parseInt(args[7])  // User-defined
            : frames > cols             // If more frames than cols...
                ? Math.ceil(frames / cols) // ...then expect more rows
                : 1;                    // Otherwise, default single row

        result[name] = {
            u, v,
            w, h,
            frames,
            cols,
            rows,
            name,
        };
    }
    return result;
}
