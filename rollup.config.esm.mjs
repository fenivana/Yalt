import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/index.mjs',
  output: {
    format: 'es',
    file: 'dist/Yalt.esm.js'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel()
  ],
  external: ['sprintf-js']
}
