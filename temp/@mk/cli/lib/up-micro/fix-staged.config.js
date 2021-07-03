module.exports = {
  'src/**/*.{js,jsx,ts,tsx,vue}': ['eslint --fix', 'git add'],
  'src/**/*.{vue,sass,scss,less,css}': ['stylelint --fix', 'git add'],
};
