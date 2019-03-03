module.exports = {
  externals: {
      // "rxjs": "rxjs",
      // "@angular/core": "ng.core",
      // "@angular/common": "ng.common",
      // "@angular/platform-browser": "ng.platformBrowser",
      // "@angular/elements": "ng.elements",
      // "zapjs": "zapjs",
      // "web3": "web3",
      "bn.js": "BN",
      // "web3-utils": "web3-utils",
  },
  node: {
    crypto: true,
    stream: true,
  }
}
