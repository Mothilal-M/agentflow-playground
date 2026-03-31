# Agentflow Playground

Agentflow Playground is a React + Vite frontend that demonstrates integration with the `@10xscale/agentflow-client` and associated agent orchestration features.

## 🛠️ Features

- React 19 + Vite 6
- Redux Toolkit + React Query (TanStack)
- Agent flow UI components (conversations, graph explorer, dashboards)
- i18n (English/Hindi)
- Tailwind CSS styling with Radix UI primitives
- Mock API support with MSW (Mock Service Worker)
- Unit and integration tests with Vitest, Playwright support

## 🚀 Quickstart

### Prerequisites

- Node.js 20+ (recommended 22)
- npm 11+

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 🧪 Testing

- Run tests:

```bash
npm run test
```

- Run coverage:

```bash
npm run coverage
```

- Run Vitest UI:

```bash
npm run test:ui
```

## 🔍 Lint and format

```bash
npm run lint
npm run lint:fix
npm run format
```

## 📁 Key folders

- `src/` - React app source code
- `src/components` - reusable UI components
- `src/pages` - route pages
- `src/services` - API, query, store logic
- `src/hooks` - custom hooks
- `src/lib` - shared utilities
- `public/` - static assets and MSW service worker

## 🌎 Localization

Supported languages are in `src/locales/en/translation.json` and `src/locales/hi/translation.json`. The app uses `react-i18next` with language detection in the browser.

## 🪪 Environment variables

Add project-specific config in `.env` (if used). Vite supports `.env`, `.env.development`, and `.env.production`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Open a pull request with a clear description

---

> This README was updated to match the current project structure and npm scripts.
