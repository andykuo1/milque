import { isWebGL2Supported } from '../GLHelper.js';

export class BufferDataContext
{
    /**
     * @param {WebGLRenderingContextBase} gl The gl context.
     * @param {GLenum} target The buffer bind target. Usually, this is
     * `gl.ARRAY_BUFFER` or `gl.ELEMENT_ARRAY_BUFFER`.
     */
    constructor(gl, target)
    {
        this.gl = gl;
        this.target = target;
    }

    /**
     * @param {BufferSource|number} srcDataOrSize The buffer data source or the buffer size in bytes.
     * @param {GLenum} [usage] The buffer data usage. By default, this is `gl.STATIC_DRAW`.
     * @returns {BufferDataContext}
     */
    data(srcDataOrSize, usage = undefined)
    {
        const gl = this.gl;
        const target = this.target;
        if (typeof srcDataOrSize === 'number')
        {
            gl.bufferData(target, srcDataOrSize, usage || gl.STATIC_DRAW);
        }
        else
        {
            if (!ArrayBuffer.isView(srcDataOrSize)) throw new Error('Source data must be a typed array.');
            gl.bufferData(target, srcDataOrSize, usage || gl.STATIC_DRAW);
        }
        return this;
    }

    /**
     * @param {BufferSource} srcData The buffer data source.
     * @param {number} [dstOffset] The destination byte offset to put the data.
     * @param {number} [srcOffset] The source array index offset to copy the data from.
     * @param {number} [srcLength] The source array count to copy the data until.
     * @returns {BufferDataContext}
     */
    subData(srcData, dstOffset = 0, srcOffset = undefined, srcLength = undefined)
    {
        const gl = this.gl;
        const target = this.target;
        if (!ArrayBuffer.isView(srcData)) throw new Error('Source data must be a typed array.');
        if (srcOffset)
        {
            if (isWebGL2Supported(gl))
            {
                gl.bufferSubData(target, dstOffset, srcData, srcOffset, srcLength);
            }
            else
            {
                const srcSubData = srcLength
                    ? srcData.subarray(srcOffset, srcOffset + srcLength)
                    : srcData.subarray(srcOffset);
                gl.bufferSubData(target, dstOffset, srcSubData);
            }
        }
        else
        {
            gl.bufferSubData(target, dstOffset, srcData);
        }
        return this;
    }
}

export class BufferBuilder extends BufferDataContext
{
    /**
     * @param {WebGLRenderingContextBase} gl The webgl context.
     * @param {GLenum} target The buffer bind target. Usually, this is
     * `gl.ARRAY_BUFFER` or `gl.ELEMENT_ARRAY_BUFFER`.
     * @param {WebGLBuffer} [buffer] The buffer handle. If undefined, a
     * new buffer will be created.
     */
    constructor(gl, target, buffer = undefined)
    {
        super(gl, target);
        this.handle = buffer || gl.createBuffer();

        gl.bindBuffer(target, this.handle);
    }
    
    /** @returns {WebGLBuffer} */
    build()
    {
        return this.handle;
    }
}
