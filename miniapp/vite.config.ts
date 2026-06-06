import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'
import fs from 'fs'

// 将 static、cloudfunctions 等资源目录复制到 dist
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const root = path.resolve(__dirname)
      // 复制 cloudfunctions
      const cfSrc = path.join(root, 'cloudfunctions')
      const cfDest = path.join(root, 'dist/cloudfunctions')
      if (fs.existsSync(cfSrc)) {
        fs.cpSync(cfSrc, cfDest, { recursive: true })
      }
      // 复制 static（如果 uni 插件没有自动复制）
      const staticSrc = path.join(root, 'static')
      const staticDest = path.join(root, 'dist/static')
      if (fs.existsSync(staticSrc) && !fs.existsSync(staticDest)) {
        fs.cpSync(staticSrc, staticDest, { recursive: true })
      }
      // 确保 dist/project.config.json 包含 cloudfunctionRoot
      const distConfigPath = path.join(root, 'dist/project.config.json')
      if (fs.existsSync(distConfigPath)) {
        const config = JSON.parse(fs.readFileSync(distConfigPath, 'utf-8'))
        if (!config.cloudfunctionRoot) {
          config.cloudfunctionRoot = 'cloudfunctions/'
          delete config.cloudfunctionTemplateRoot
          fs.writeFileSync(distConfigPath, JSON.stringify(config, null, 2))
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [uni.default ? uni.default() : uni(), copyStaticAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    fs: {
      strict: false
    },
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.agents/**', '**/logs/**']
    }
  }
})
