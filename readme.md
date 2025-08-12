# SAC Implementation Tracker

A persistent, fully client-side app to track SAP Analytics Cloud implementation.

## Features

- Overview, Phases, Timeline (Gantt), and Team tabs  
- Mark processes complete → live sync in Overview  
- Editable Gantt in Timeline  
- Add/Edit/Delete team members  
- Full persistence via `localStorage`  
- Self-test button for manual verification  

## Deploy on GitHub Pages

1. Create a GitHub repo and clone it.  
2. Copy all files above into the root.  
3. Commit & push to `main`.  
4. In your repo’s Settings → Pages, set **Source** to `main` / root.  
5. Visit `https://<username>.github.io/<repo>/`.

Your data now persists across refreshes—team deletions, process completions, and timeline edits will stick.
