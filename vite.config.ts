import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		https: {
		  key: fs.readFileSync("/home/oem/localhost+1-key.pem"),
		  cert: fs.readFileSync("/home/oem/localhost+1.pem")
		},
		host: '0.0.0.0' // agar dapat diakses dari perangkat lain
	  }
});
