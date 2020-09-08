// @ts-nocheck
import { rollupConfig } from '../.config/RollupHelper.js';
import * as packageJson from './package.json';
export default args => rollupConfig(
    args, packageJson,
    {
        entries: [
            'src/view/index.js',
            'src/camera/index.js',
        ]
    }
);
