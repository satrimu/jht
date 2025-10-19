# How to Publish these pages to the GitHub Wiki

The GitHub Wiki is a separate git repository. To publish these local pages to the wiki, follow these steps.

1. Clone the wiki repo (replace owner/repo):

```bash
# Clone the wiki remote
git clone https://github.com/<owner>/<repo>.wiki.git repo-wiki
```

2. Copy or sync files from this repo's `docs/wiki/` into the cloned wiki repo:

```bash
cp -R docs/wiki/* repo-wiki/
cd repo-wiki
```

3. Commit and push:

```bash
git add .
git commit -m "Update wiki pages"
git push origin main
```

4. Verify the wiki on GitHub at: `https://github.com/<owner>/<repo>/wiki`.

Notes:
- If your repository is private, you may need to use an SSH remote or a token-enabled HTTPS remote.
- Alternatively, create a PR against a `docs` or `wiki` branch in the main repo and share changes for review before publishing.
