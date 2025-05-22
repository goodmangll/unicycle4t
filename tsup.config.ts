import { defineConfig } from 'tsup'

export default defineConfig({
  // 入口文件
  entry: ['src/index.ts'],
  // 输出格式：ESM 和 CommonJS
  format: ['esm', 'cjs'],
  // 生成类型声明文件（.d.ts）
  dts: true,
  // 打包前清理输出目录
  clean: true,
  // 输出目录
  outDir: 'dist',
  // 禁用代码分割（适合库）
  splitting: false,
  // 生成 sourcemap 方便调试
  sourcemap: true,
  // 不压缩代码，便于开发调试
  minify: false,
})
