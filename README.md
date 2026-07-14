# Hayden Workout App

A personal workout, nutrition, calendar, reminder, and progress tracking app.

This repository now contains:

- the existing web app built with React, TypeScript, and Vite
- a new native mobile app prototype built with Expo and React Native in `mobile/`

## Features

- A/B training split focused on glutes, shoulders, core, and posture
- Exercise library with target muscles, videos, sets, reps, and time targets
- Progressive overload suggestions based on completed sets and difficulty
- Training calendar with A/B/rest day planning
- Training-day reminders while the app is open in a browser tab
- Timer completion sound and phone vibration where supported
- Nutrition guidance, meal templates, recipes, shopping list, and whey protein notes
- Body tracking for weight, waist, hips, shoulders, sleep, and notes
- Training logs for load, reps, and difficulty
- PWA manifest and basic offline app-shell caching

## Data Storage

This app currently stores all personal data in the browser with `localStorage`.

That is the right choice for the current version because:

- no account or login is needed
- no backend cost or database setup is required
- personal fitness data stays on the user's device
- the app can be deployed as a static site

Use a database later if the product needs:

- multi-device sync
- user accounts
- cloud backup and restore
- shared plans between users
- admin analytics or coaching features

Recommended future stack for that stage: Supabase, Firebase, or a small API with Postgres.

## Important Limitations

- Browser reminders only work while the app is open in a tab or installed PWA context supported by the browser.
- `localStorage` data can be lost if the user clears browser data.
- The nutrition and training content is general fitness guidance, not medical advice.
- Users with injuries, medical conditions, pregnancy, or pain during exercise should consult a qualified professional.

## Development

Web app:

```bash
npm install
npm run dev
```

Mobile app:

```bash
cd mobile
npm install
npm run start
```

Use Expo Go on iPhone or Android to scan the QR code from Expo.

## Build

Web app:

```bash
npm run build
```

The build output is written to `dist/`.

Mobile app type check:

```bash
cd mobile
npx tsc --noEmit
```

For native app builds later, use Expo EAS Build.

## Deployment

This is a static Vite app. It can be deployed to:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

For Vercel, Netlify, or Cloudflare Pages:

- build command: `npm run build`
- output directory: `dist`

## Release Checklist

- Run `npm run build`
- Test desktop and mobile layouts
- Test the training timer sound/vibration after pressing Start
- Test calendar reminders after granting notification permission
- Test PWA install prompt on supported browsers
- Verify Chinese and English content renders correctly
- Confirm browser data persistence behavior is acceptable for the release
