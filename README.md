# Snapa (учебный)

Учебная вёрстка сайта Snapa с нуля по макетам Figma: Vite + React + TypeScript + Tailwind CSS v4.

## Быстрый старт

```bash
npm install
npm run dev       # локальный сервер с HMR
npm run build     # прод-сборка
npm run lint      # oxlint
npm run format    # prettier --write .
```

## Figma

Подключение к Figma Dev Mode MCP Server описано в [CLAUDE.md](./CLAUDE.md).
Основной рабочий процесс — скилл [`.claude/skills/figma-to-code`](./.claude/skills/figma-to-code/SKILL.md).

## Структура

- `src/components/` — переиспользуемые UI-компоненты
- `src/pages/` — сборка компонентов в страницы
- `src/lib/` — хелперы, хуки, утилиты
- `src/assets/` — картинки/иконки из Figma
