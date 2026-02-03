# Finite

An API to generate images visualizing life progress - year progress, life in weeks, and life in days.

## Features

- 📊 Generate beautiful progress images showing year statistics
- 📈 Get JSON statistics for days passed/remaining
- 🎨 Visually appealing gradient design with progress bar

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### `GET /`
Returns API information and available endpoints.

### `GET /image`
Generates and returns a PNG image showing:
- Year progress bar with percentage
- Days passed
- Days remaining
- Percentage remaining

### `GET /stats`
Returns year progress statistics as JSON:

```json
{
  "year": 2026,
  "totalDays": 365,
  "daysPassed": 34,
  "daysRemaining": 331,
  "percentagePassed": 9.32,
  "percentageRemaining": 90.68
}
```

## Example

Visit `http://localhost:3000/image` in your browser to see the generated image.

## License

MIT
