module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/template.html',
      filename: 'index.html'
    }
  },
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
};
