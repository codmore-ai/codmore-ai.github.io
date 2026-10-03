import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages：组织/用户根站点（<login>.github.io）发在根路径，其余仓库发在 /<repo>/ 下。
// dev 时没有 GITHUB_REPOSITORY，走根路径。
function pagesBase() {
  const slug = process.env.GITHUB_REPOSITORY
  if (!slug) return '/'
  const [owner, repo] = slug.split('/')
  return repo === `${owner}.github.io` ? '/' : `/${repo}/`
}

export default defineConfig({
  base: pagesBase(),
  plugins: [react(), tailwindcss()],
})
