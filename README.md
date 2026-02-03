# Finite

![Tests](https://github.com/PERRETJonatan/Finite/actions/workflows/test.yml/badge.svg)

> *"The trouble is, you think you have time."* — Jack Kornfield

A Node.js API that generates powerful visual reminders of time's passage. Create beautiful wallpaper images showing year progress, life in weeks, or life in days.

## ✨ Features

- **Year Progress** — Visualize how much of the current year has passed
- **Life in Weeks** — See your entire life as a grid of weeks (inspired by [Wait But Why](https://waitbutwhy.com/2014/05/life-weeks.html))
- **Life in Days** — Even more granular view of your life in days
- **iPhone Wallpapers** — Built-in presets for iPhone lock screens with safe areas for clock/widgets
- **Timezone Support** — Accurate calculations for any timezone
- **Beautiful Design** — Dark gradient backgrounds with colorful progress indicators

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/PERRETJonatan/Finite.git
cd Finite

# Install dependencies
npm install

# Start the server
npm start
```

The API will be running at `http://localhost:3000`

## 📡 API Endpoints

### `GET /` — API Info
Returns available endpoints and parameters.

### `GET /image` — Year Progress
Generates a year progress visualization.

```
GET /image?timezone=America/New_York&preset=iphone-pro
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `timezone` | IANA timezone (e.g., `Europe/London`) | `UTC` |
| `width` | Image width in pixels | `800` |
| `height` | Image height in pixels | `500` |
| `paddingTop` | Top padding for clock area | `0` |
| `paddingBottom` | Bottom padding for widgets | `0` |
| `preset` | Device preset (see below) | — |

### `GET /life` — Life in Weeks
Generates a life-in-weeks visualization.

```
GET /life?birthdate=1990-05-15&maxAge=80&preset=iphone-pro
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `birthdate` | Date of birth (`YYYY-MM-DD`) | **Required** |
| `maxAge` | Expected lifespan in years | `80` |
| `timezone` | IANA timezone | `UTC` |
| `preset` | Device preset (see below) | — |

### `GET /life-days` — Life in Days
Generates a life-in-days visualization (same parameters as `/life`).

```
GET /life-days?birthdate=1990-05-15&maxAge=80&preset=iphone-pro
```

### `GET /stats` — JSON Statistics
Returns year progress as JSON.

```json
{
  "year": 2026,
  "timezone": "UTC",
  "totalDays": 365,
  "daysPassed": 34,
  "daysRemaining": 331,
  "percentagePassed": 9.32,
  "percentageRemaining": 90.68
}
```

## 📱 iPhone Presets

Use the `preset` parameter for perfect iPhone wallpapers:

| Preset | Resolution | Device |
|--------|-----------|--------|
| `iphone-standard` | 1170×2532 | iPhone 12/13/14 |
| `iphone-pro` | 1179×2556 | iPhone 14/15 Pro |
| `iphone-pro-max` | 1290×2796 | iPhone 14/15 Pro Max |

Example:
```
GET /life?birthdate=1990-05-15&preset=iphone-pro-max&timezone=Europe/Paris
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run only image generator tests
npm run test:image

# Run only API tests
npm run test:api
```

## 🛠️ Development

```bash
# Start with auto-reload
npm run dev
```

## 📖 Philosophy

Finite is inspired by the concept of **memento mori** — the ancient practice of reflecting on mortality to live more fully. By visualizing the finite nature of time, we hope to inspire intentional living.

Each dot represents a week or day of your life:
- **Colored dots** = Time already lived
- **Grey dots** = Time remaining (statistically)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Jonatan Perret](https://github.com/PERRETJonatan)

---

<p align="center">
  <i>Make every dot count.</i>
</p>
