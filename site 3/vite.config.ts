import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'copy-static-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distSrcAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distSrcAssets, {recursive: true, force: true});
          }
          const rootAssets = path.resolve(__dirname, 'assets/images');
          const distRootAssets = path.resolve(distDir, 'assets/images');
          if (fs.existsSync(distDir) && fs.existsSync(rootAssets)) {
            fs.cpSync(rootAssets, distRootAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'about.html'),
          services: path.resolve(__dirname, 'services.html'),
          gallery: path.resolve(__dirname, 'gallery.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          cities: path.resolve(__dirname, 'cities.html'),
          ludhiana: path.resolve(__dirname, 'cities/ludhiana.html'),
          patiala: path.resolve(__dirname, 'cities/patiala.html'),
          bathinda: path.resolve(__dirname, 'cities/bathinda.html'),
          sangrur: path.resolve(__dirname, 'cities/sangrur.html'),
          moga: path.resolve(__dirname, 'cities/moga.html'),
          amritsar: path.resolve(__dirname, 'cities/amritsar.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
