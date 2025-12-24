# GitHub Pages Setup Guide

## Why GitHub Pages?
✅ **Free** - No cost  
✅ **Easy** - Just enable in settings, no backend needed  
✅ **Automatic** - Updates when you push to GitHub  
✅ **File Downloads** - All files are directly downloadable  
✅ **No Maintenance** - Works automatically  

## Setup Steps (5 minutes)

### 1. Push your code to GitHub
If you haven't already:
```bash
git add .
git commit -m "Add site for GitHub Pages"
git push origin main
```

### 2. Enable GitHub Pages
1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/site` (or `/` if you want root)
5. Click **Save**

### 3. Wait 1-2 minutes
GitHub will build your site. You'll see a green checkmark when it's ready.

### 4. Access your site
Your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/site/
```

Or if you set it to root:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## Important Notes

### File Paths
Your HTML files use relative paths like `../paper_a_analysis/...`. These will work on GitHub Pages as long as:
- All referenced files are committed to the repo
- Paths are relative (which they already are ✅)

### Large Files
GitHub has limits:
- **Individual files**: 100 MB max
- **Repository**: 1 GB recommended (50 GB hard limit)
- **Large files**: Use Git LFS for files > 100 MB

Your DOCX files and PNG figures should be fine (they're typically < 10 MB each).

### Private vs Public
- **Public repo**: Site is public, anyone can access
- **Private repo**: Site is still public (GitHub Pages limitation)
  - Consider making repo public if you want to share
  - Or use a custom domain with authentication

## Custom Domain (Optional)
If you want a custom domain (e.g., `yourname.com`):
1. In GitHub Pages settings, add your custom domain
2. Update your DNS records
3. GitHub will handle HTTPS automatically

## Testing Locally
Before pushing, test locally:
```bash
cd site
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Troubleshooting

### Files not loading?
- Check that files are committed: `git status`
- Verify paths are correct (case-sensitive on Linux)
- Check browser console for 404 errors

### Site not updating?
- Wait 1-2 minutes after pushing
- Check Actions tab for build errors
- Clear browser cache

### Want to exclude files?
Add to `.gitignore`:
```
# Large data files
*.7z
*.zip
large_data/
```

## Alternative: Netlify (Even Easier!)
If you want even less work:
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `site/` folder
3. Done! Free custom domain included

But GitHub Pages is already very easy and integrated with your repo.











