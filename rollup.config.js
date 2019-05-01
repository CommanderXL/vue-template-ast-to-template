import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: './lib/index.ts',
  output: {
    file: './dist/index.js',
    format: 'cjs'
  },
  plugins: [resolve(), commonjs(), typescript()]
}