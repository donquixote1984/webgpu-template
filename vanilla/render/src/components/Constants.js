export const DEFAULT_MODEL_BUFFER_SIZE = 1024 * 10;
export const DEFAULT_BUFFER_SIZE = 256;
export const BINDGROUPTYPE = Object.freeze({
    UNIFORM:   Symbol("uniform"),
    TEXTURE:  Symbol("texture"),
    SAMPLER: Symbol("sampler")
});

export const TEXTURE_TYPE = Object.freeze({
    DIFFUSE:   Symbol("diffuse"),
    NORMAL:  Symbol("normal"),
    ROUGHNESS: Symbol("roughness")
});