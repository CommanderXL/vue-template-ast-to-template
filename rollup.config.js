import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
  input: './lib/index.ts',
  output: {
    file: pkg.main,
    format: 'cjs'
  },
  plugins: [resolve(), commonjs(), typescript()]
}