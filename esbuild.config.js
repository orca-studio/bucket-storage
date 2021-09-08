const fs = require('fs');
const { build } = require('esbuild');
const alias = require('esbuild-plugin-alias');


const outdir= 'lib';

const options = {
  entryPoints: ['./src/index.ts'],
  outdir: outdir,
  bundle: true,
  loader: {
    '.ts': 'ts',
    '.d.ts': 'ts',
  },
  format: 'esm',
  platform: 'browser',
  sourcemap: false,
  external:['crypto-js'],
  target: [
    'chrome58',
    'es6',
  ],
  write: true,
  plugins: [
    alias({
      '@': './src/',
    }),
  ],
};

Promise.all([
  build({
    ...options,
    outExtension: {
      '.js': '.min.js',
    },
    minify: true,
  }), build({
    ...options,
    outExtension: {
      '.js': '.js',
    },
    minify: false,
  })]).then(() => {
  fs.copyFileSync('./src/types/index.d.ts',outdir+'/index.d.ts');
}).catch(() => process.exit(1));