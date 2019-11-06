import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import react from 'react';
import reactDom from 'react-dom';
import replace from '@rollup/plugin-replace';

export default {
	input: ['src/index.js'],
	output: {
		file: 'dist/index.js',
    format: 'es',
		sourcemap: true
	},
	plugins: [
    resolve(),
    babel(),
    // This allows us to include React as a CommonJS module 
    // And still have imports work
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        react: Object.keys(react),
        'react-dom': Object.keys(reactDom)
      }
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    })
  ]
};
