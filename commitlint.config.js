const { execSync } = require('child_process');

try {
  // 检查是否安装了 @commitlint/config-conventional
  execSync('npm list @commitlint/config-conventional', { stdio: 'ignore' });
  module.exports = {
    extends: ['@commitlint/config-conventional']
  };
} catch (error) {
  // 如果没有安装，使用基本配置
  module.exports = {
    rules: {
      'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']],
      'subject-empty': [2, 'never'],
      'subject-max-length': [2, 'always', 50],
      'type-empty': [2, 'never']
    }
  };
}