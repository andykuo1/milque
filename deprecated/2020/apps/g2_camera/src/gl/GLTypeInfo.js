let TYPE_INFO = null;

export function getTypeInfo(gl, type) {
    if (!TYPE_INFO) {
        TYPE_INFO = createTypeInfo(gl);
    }
    return TYPE_INFO[type];
}

/** Whether the type should be a uniform sampler. */
export function isUniformSamplerType(gl, type) {
    let typeInfo = getTypeInfo(gl, type);
    return 'sampler' in typeInfo;
}

/** Get the element type if the passed-in type is a vector type. Otherwise, returns the same type. */
export function getVectorElementType(gl, type)
{
    let typeInfo = getTypeInfo(gl, type);
    if ('arrayType' in typeInfo)
    {
        return typeInfo.arrayType;
    }
    else
    {
        return type;
    }
}

export function getUniformFunction(gl, type) {
    let typeInfo = getTypeInfo(gl, type);
    return typeInfo.uniform;
}

export function getUniformArrayFunction(gl, type) {
    let typeInfo = getTypeInfo(gl, type);
    return typeInfo.arrayUniform;
}

export function getUniformSamplerFunction(gl, samplerType, textureUnit) {
    let typeInfo = getTypeInfo(gl, samplerType);
    return typeInfo.sampler(typeInfo.bindPoint, textureUnit);
}

export function getUniformSamplerArrayFunction(gl, samplerType, textureUnit, arraySize) {
    let typeInfo = getTypeInfo(gl, samplerType);
    return typeInfo.arraySampler(typeInfo.bindPoint, textureUnit, arraySize);
}

function createTypeInfo(gl) {
    let result = {};

    if (gl instanceof WebGLRenderingContext)
    {
        result[gl.FLOAT]                         = { TypedArray: Float32Array, size:  4, uniform: gl.uniform1f,     arrayUniform: gl.uniform1fv, };
        result[gl.FLOAT_VEC2]                    = { TypedArray: Float32Array, size:  8, uniform: gl.uniform2fv,    arrayType: gl.FLOAT };
        result[gl.FLOAT_VEC3]                    = { TypedArray: Float32Array, size: 12, uniform: gl.uniform3fv,    arrayType: gl.FLOAT };
        result[gl.FLOAT_VEC4]                    = { TypedArray: Float32Array, size: 16, uniform: gl.uniform4fv,    arrayType: gl.FLOAT };
        result[gl.INT]                           = { TypedArray: Int32Array,   size:  4, uniform: gl.uniform1i,     arrayUniform: gl.uniform1iv, };
        result[gl.INT_VEC2]                      = { TypedArray: Int32Array,   size:  8, uniform: gl.uniform2iv,    arrayType: gl.INT };
        result[gl.INT_VEC3]                      = { TypedArray: Int32Array,   size: 12, uniform: gl.uniform3iv,    arrayType: gl.INT};
        result[gl.INT_VEC4]                      = { TypedArray: Int32Array,   size: 16, uniform: gl.uniform4iv,    arrayType: gl.INT};
        result[gl.UNSIGNED_INT]                  = { TypedArray: Uint32Array,  size:  4, uniform: gl.uniform1ui,    arrayUniform: gl.uniform1uiv, };
        result[gl.UNSIGNED_INT_VEC2]             = { TypedArray: Uint32Array,  size:  8, uniform: gl.uniform2uiv,   arrayType: gl.UNSIGNED_INT };
        result[gl.UNSIGNED_INT_VEC3]             = { TypedArray: Uint32Array,  size: 12, uniform: gl.uniform3uiv,   arrayType: gl.UNSIGNED_INT };
        result[gl.UNSIGNED_INT_VEC4]             = { TypedArray: Uint32Array,  size: 16, uniform: gl.uniform4uiv,   arrayType: gl.UNSIGNED_INT };
        result[gl.BOOL]                          = { TypedArray: Uint32Array,  size:  4, uniform: gl.uniform1i,     arrayUniform: gl.uniform1iv, };
        result[gl.BOOL_VEC2]                     = { TypedArray: Uint32Array,  size:  8, uniform: gl.uniform2iv,    arrayType: gl.BOOL };
        result[gl.BOOL_VEC3]                     = { TypedArray: Uint32Array,  size: 12, uniform: gl.uniform3iv,    arrayType: gl.BOOL };
        result[gl.BOOL_VEC4]                     = { TypedArray: Uint32Array,  size: 16, uniform: gl.uniform4iv,    arrayType: gl.BOOL };
        result[gl.FLOAT_MAT2]                    = { TypedArray: Float32Array, size: 16, uniform: _uniformMatrix2fv,  arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT3]                    = { TypedArray: Float32Array, size: 36, uniform: _uniformMatrix3fv,  arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT4]                    = { TypedArray: Float32Array, size: 64, uniform: _uniformMatrix4fv,  arrayType: gl.FLOAT };

        result[gl.UNSIGNED_BYTE]                 = { TypedArray: Uint8Array,   size: 1 };
        result[gl.UNSIGNED_SHORT]                = { TypedArray: Uint16Array,  size: 2 };
    }
    else
    {
        throw new Error('Unknown gl context provided.');
    }

    if (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)
    {
        result[gl.FLOAT_MAT2x3]                  = { TypedArray: Float32Array, size: 24, uniform: _uniformMatrix2x3fv, arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT2x4]                  = { TypedArray: Float32Array, size: 32, uniform: _uniformMatrix2x4fv, arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT3x2]                  = { TypedArray: Float32Array, size: 24, uniform: _uniformMatrix3x2fv, arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT3x4]                  = { TypedArray: Float32Array, size: 48, uniform: _uniformMatrix3x4fv, arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT4x2]                  = { TypedArray: Float32Array, size: 32, uniform: _uniformMatrix4x2fv, arrayType: gl.FLOAT };
        result[gl.FLOAT_MAT4x3]                  = { TypedArray: Float32Array, size: 48, uniform: _uniformMatrix4x3fv, arrayType: gl.FLOAT };
        loadSamplerTypeInfos(gl, result, _uniformSamplerWebGL2, _uniformSamplerArrayWebGL2);
    }
    else
    {
        loadSamplerTypeInfos(gl, result, _uniformSamplerWebGL1, _uniformSamplerArrayWebGL1);
    }

    return result;
}

function loadSamplerTypeInfos(gl, result, samplerSetter, samplerArraySetter) {
    result[gl.SAMPLER_2D]                    = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D,       };
    result[gl.SAMPLER_CUBE]                  = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_CUBE_MAP, };
    result[gl.SAMPLER_3D]                    = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_3D,       };
    result[gl.SAMPLER_2D_SHADOW]             = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D,       };
    result[gl.SAMPLER_2D_ARRAY]              = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D_ARRAY, };
    result[gl.SAMPLER_2D_ARRAY_SHADOW]       = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D_ARRAY, };
    result[gl.SAMPLER_CUBE_SHADOW]           = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_CUBE_MAP, };
    result[gl.INT_SAMPLER_2D]                = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D,       };
    result[gl.INT_SAMPLER_3D]                = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_3D,       };
    result[gl.INT_SAMPLER_CUBE]              = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_CUBE_MAP, };
    result[gl.INT_SAMPLER_2D_ARRAY]          = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D_ARRAY, };
    result[gl.UNSIGNED_INT_SAMPLER_2D]       = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D,       };
    result[gl.UNSIGNED_INT_SAMPLER_3D]       = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_3D,       };
    result[gl.UNSIGNED_INT_SAMPLER_CUBE]     = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_CUBE_MAP, };
    result[gl.UNSIGNED_INT_SAMPLER_2D_ARRAY] = { TypedArray: null,         size:  0, sampler: samplerSetter, arraySampler: samplerArraySetter, bindPoint: gl.TEXTURE_2D_ARRAY, };
    return result;
}

function _uniformMatrix2fv(location, v) {
    this.uniformMatrix2fv(location, false, v);
}

function _uniformMatrix3fv(location, v) {
    this.uniformMatrix3fv(location, false, v);
}

function _uniformMatrix4fv(location, v) {
    this.uniformMatrix4fv(location, false, v);
}

function _uniformMatrix2x3fv(location, v) {
    this.uniformMatrix2x3fv(location, false, v);
}

function _uniformMatrix3x2fv(location, v) {
    this.uniformMatrix3x2fv(location, false, v);
}

function _uniformMatrix2x4fv(location, v) {
    this.uniformMatrix2x4fv(location, false, v);
}

function _uniformMatrix4x2fv(location, v) {
    this.uniformMatrix4x2fv(location, false, v);
}

function _uniformMatrix3x4fv(location, v) {
    this.uniformMatrix3x4fv(location, false, v);
}

function _uniformMatrix4x3fv(location, v) {
    this.uniformMatrix4x3fv(location, false, v);
}

function _uniformSamplerWebGL1(bindPoint, unit) {
    return function (location, texture) {
        this.uniform1i(location, unit);
        this.activeTexture(this.TEXTURE0 + unit);
        this.bindTexture(bindPoint, texture);
    };
}

function _uniformSamplerArrayWebGL1(bindPoint, unit, size) {
    const units = new Int32Array(size);
    for (let ii = 0; ii < size; ++ii) {
        units[ii] = unit + ii;
    }
    return function (location, textures) {
        this.uniform1iv(location, units);
        textures.forEach(function (texture, index) {
            this.activeTexture(this.TEXTURE0 + units[index]);
            this.bindTexture(bindPoint, texture);
        });
    };
}

function _uniformSamplerWebGL2(bindPoint, unit) {
    return function (location, textureOrPair) {
        let texture;
        let sampler;
        if (textureOrPair instanceof WebGLTexture) {
            texture = textureOrPair;
            sampler = null;
        } else {
            texture = textureOrPair.texture;
            sampler = textureOrPair.sampler;
        }
        this.uniform1i(location, unit);
        this.activeTexture(this.TEXTURE0 + unit);
        this.bindTexture(bindPoint, texture);
        this.bindSampler(unit, sampler);
    };
}

function _uniformSamplerArrayWebGL2(bindPoint, unit, size) {
    const units = new Int32Array(size);
    for (let ii = 0; ii < size; ++ii) {
        units[ii] = unit + ii;
    }
    return function (location, textures) {
        this.uniform1iv(location, units);
        textures.forEach(function (textureOrPair, index) {
            this.activeTexture(this.TEXTURE0 + units[index]);
            let texture;
            let sampler;
            if (textureOrPair instanceof WebGLTexture) {
                texture = textureOrPair;
                sampler = null;
            } else {
                texture = textureOrPair.texture;
                sampler = textureOrPair.sampler;
            }
            this.bindSampler(unit, sampler);
            this.bindTexture(bindPoint, texture);
        });
    };
}
