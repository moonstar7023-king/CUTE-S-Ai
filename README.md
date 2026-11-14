# CUTE-S AI 🐰
Free AI study buddy + shared notes library for students. Static web app (HTML/CSS/JS) using Firebase (login, notes) and Puter.js (free AI chat).

## Setup
1. Firebase Console: create project, enable Authentication (Email/Password, Phone), create Firestore, enable Storage.
2. Paste your web config in `firebase-config.js`.
3. Paste `firestore.rules` and `storage.rules` in the Firebase Rules tabs and Publish.
4. Authentication > Settings > Authorized domains: add `YOURNAME.github.io`.
5. Host with GitHub Pages (Settings > Pages > main / root).

Contact: moonstar7023@gmail.com

## Commands (type `/` in the chat)
Just type a command or ask in plain words ("make a ppt on AI", "draw a cat").
- **Images:** `/image a rabbit studying --16:9 --x2 --anime`, `/edit make the background blue` (attach a photo first), `/logo`, `/poster`, `/wallpaper`, `/dp`, `/thumbnail`, `/sticker`, `/diagram`, `/anime`, `/cartoon`, `/3d`, `/realistic`
- **Study:** `/quiz 5 topic`, `/cards`, `/notes`, `/research`, `/explain`, `/solve`, `/debug`, `/mindmap`, `/plan`, `/viva`, `/translate`, `/essay`, `/email`, `/compare` ... (attach a PDF/photo and the command uses it)
- **Files:** `/word`, `/excel`, `/ppt`, `/pdf`, `/txt`, `/md`, `/csv`, `/json`, `/xml`, `/html`, `/ics` (Outlook/Google calendar), `/vcf`, `/zip`, `/tsv`, `/htm`, `/eml`, Word: `/doc /docm /dotx /dotm /rtf /odt`, Excel: `/xls /xlsm /xltx /xltm /ods`, PowerPoint: `/pptm /ppsx /ppsm /potx /potm /odp`, `/code python ...`, `/file name.ext ...`, plus `/cv`, `/letter`, `/report`, `/invoice`, `/timetable`, `/budget`, `/attendance`
  - `/word` (or `/excel`, `/ppt`, `/pdf`) with no text converts the last answer into a file.
  - Each file card has Download, Preview, Share, Change (✏️ edit with an instruction) and Redo.
- **App:** `/help`, `/new`, `/history`, `/settings`, `/deep`, `/search on`, `/lang ur`, `/focus`, `/save`

Files: `cmd.js` (command router + UI), `office.js` (real .docx / .xlsx / .zip builders, no CDN needed; .pptx uses PptxGenJS from cdnjs).
