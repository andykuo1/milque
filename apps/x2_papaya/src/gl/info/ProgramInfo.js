import { getActiveUniformsInfo } from './ProgramUniformInfo.js';
import { getActiveAttribsInfo } from './ProgramAttributeInfo.js';
import { ProgramBuilder } from '../program/ProgramBuilder.js';
import { draw } from '../program/ProgramHelper.js';

export class ProgramInfoBuilder extends ProgramBuilder
{
    constructor(gl)
    {
        super(gl);
    }

    /** @override */
    link()
    {
        const handle = super.link();
        return new ProgramInfo(this.gl, handle);
    }
}

export class ProgramInfo
{
    static from(gl)
    {
        return new ProgramInfoBuilder(gl);
    }

    constructor(gl, program)
    {
        this.handle = program;

        this.activeUniforms = getActiveUniformsInfo(gl, program);
        this.activeAttributes = getActiveAttribsInfo(gl, program);

        /** @private */
        this.drawContext = new ProgramInfoDrawContext(gl, this);
    }

    bind(gl)
    {
        gl.useProgram(this.handle);

        this.drawContext.gl = gl;
        return this.drawContext;
    }
}

export class ProgramInfoDrawContext
{
    constructor(gl, programInfo)
    {
        this.gl = gl;
        /** @private */
        this.parent = programInfo;
    }
    
    uniform(uniformName, value)
    {
        const activeUniforms = this.parent.activeUniforms;
        if (uniformName in activeUniforms)
        {
            let uniform = activeUniforms[uniformName];
            let location = uniform.location;
            uniform.set.call(this.gl, location, value);
        }
        return this;
    }

    /**
     * @param {string} attributeName Name of the attribute.
     * @param {GLenum} bufferType The buffer data type. This is usually `gl.FLOAT`
     * but can also be one of `gl.BYTE`, `gl.UNSIGNED_BYTE`, `gl.SHORT`,
     * `gl.UNSIGNED_SHORT` or `gl.HALF_FLOAT` for WebGL2.
     * @param {WebGLBuffer} buffer The buffer handle.
     * @param {boolean} [normalize=false] Whether to normalize the vectors in the buffer.
     * @param {number} [stride=0] The stride for each vector in the buffer.
     * @param {number} [offset=0] The initial offset in the buffer.
     */
    attribute(attributeName, bufferType, buffer, normalize = false, stride = 0, offset = 0)
    {
        const gl = this.gl;
        const activeAttributes = this.parent.activeAttributes;
        if (attributeName in activeAttributes)
        {
            let attribute = activeAttributes[attributeName];
            let location = attribute.location;
            let size = attribute.size;
            if (buffer)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.vertexAttribPointer(location, size, bufferType, normalize, stride, offset);
                gl.enableVertexAttribArray(location);
            }
            else
            {
                gl.disableVertexAttribArray(location);
            }
        }
        return this;
    }
    
    /**
     * Draws using this program.
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {Number} mode 
     * @param {Number} offset 
     * @param {Number} count 
     * @param {WebGLBuffer} elementBuffer 
     */
    draw(gl, mode, offset, count, elementBuffer = null)
    {
        draw(gl, mode, offset, count, elementBuffer);
        return this.parent;
    }
}
