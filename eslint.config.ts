import antfu from '@antfu/eslint-config'

export default antfu({
  // 项目类型：库项目
  type: 'lib',

  // TypeScript 支持（会自动检测 tsconfig.json）
  typescript: true,

  // 只有真正需要的忽略规则
  ignores: [
    '*.d.ts', // TypeScript 声明文件
    '**/*.md', // Markdown 文档中的示例代码
    '.claude/**', // Claude 配置目录
  ],

  // 库项目特定的规则定制
  rules: {
    // 库项目允许 console，但建议警告
    'no-console': 'warn',

    // 禁止调试代码
    'no-debugger': 'error',

    // TypeScript 特定规则
    '@typescript-eslint/explicit-function-return-type': 'off', // 示例代码不强制要求返回类型
  },
})
