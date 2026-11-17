# GitRaw

A tool for converting Git repository URLs into direct raw file links.

# Usage
It's very simple to use just use like following;
`gitraw <looong github url>`

Example Usage
```bash
$ gitraw https://github.com/ColleagueRiley/RGFW/blob/main/tests/keys.c
https://raw.githubusercontent.com/ColleagueRiley/RGFW/refs/heads/main/tests/keys.c
```

# Building into a single file
Just run `npm run build` and it generates a single minified `dest/gitraw.js` file that you can use.

# License
Licensed Under The MIT License. See [LICENSE](LICENSE)