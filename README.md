# StorePreflight

npm run build
npm start

git add .
git commit -m "Commit Comments"
git push

**App Store & Google Play Preflight Scanner**

Know what Apple and Google will ask — before they ask.

![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.1.0-blue)

## What is StorePreflight?

StorePreflight is a local-first scanner that analyzes your mobile app codebase and determines exactly what Apple App Store Connect and Google Play Console will require before submission.

**No surprises. No guesswork. No rejections.**

## Features

- 🔍 **Codebase Scanning** - Detects permissions, SDKs, and capabilities
- ⚠️ **Policy Gate Detection** - Identifies what will trigger store reviews
- 📝 **Copy-Paste Answers** - Pre-written justifications ready for submission
- 📸 **Asset Processing** - Normalize screenshots to store requirements
- 📦 **Submission Pack** - Export everything you need in a ZIP

## Supported Frameworks

| Framework | Status |
|-----------|--------|
| Expo / React Native | ✅ Supported |
| Flutter | 🔜 Coming Soon |

## Capabilities Detected

- Background Location (triggers YouTube video requirement on Google Play)
- Foreground Location
- Push Notifications
- Camera Access
- Microphone Access
- Photo Library
- File Storage
- Maps Usage (Google Maps SDK)
- Payment SDKs (Stripe, IAP)
- Authentication (Firebase, OAuth)
- Analytics (Sentry, Firebase Analytics)
- Background Tasks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/storepreflight.git
cd storepreflight

# Install dependencies
npm install

# Build packages
npm run build

# Start development server
npm run dev
```

### Usage

1. Open the web UI at `http://localhost:3000`
2. Enter the path to your Expo/React Native project
3. Click "Scan"
4. Review findings and copy-paste the required text
5. Export your Submission Pack

## Project Structure

```
storepreflight/
├── apps/
│   └── web/                 # Next.js Web UI
├── packages/
│   ├── shared/              # Shared types and utilities
│   ├── scanner/             # Scanner engine with adapters
│   ├── rules/               # Rules engine and rule definitions
│   ├── assets/              # Image processing (screenshots, icons)
│   └── report/              # HTML report and ZIP generation
└── docs/                    # Documentation
```

## Packages

| Package | Description |
|---------|-------------|
| `@storepreflight/shared` | Core types and utilities |
| `@storepreflight/scanner` | Project scanning with ExpoScanner |
| `@storepreflight/rules` | 24+ store policy rules |
| `@storepreflight/assets` | Screenshot normalization, icon validation |
| `@storepreflight/report` | HTML reports and Submission Pack ZIP |

## Rules Engine

StorePreflight includes 24+ rules covering:

- **Google Play Console** - Background location, account deletion, data safety
- **App Store Connect** - Usage descriptions, Sign in with Apple, export compliance

Each rule includes:
- Trigger conditions (which capabilities activate it)
- Risk level (high/medium/low)
- Required artifacts (video, screenshots, reviewer notes)
- Copy-paste ready text

## Asset Processing

Normalize your screenshots for Google Play:
- **Screenshots**: 1080×1920 PNG, sRGB, no alpha
- **Feature Graphic**: 1024×500 JPG
- **Icon**: 512×512 validation and auto-fix

## API Usage

```typescript
import { scanProject } from "@storepreflight/scanner";
import { evaluateRules } from "@storepreflight/rules";

// Scan a project
const scan = await scanProject("/path/to/expo/project");

// Evaluate against rules
const result = evaluateRules(scan);

console.log(result.summary);
// { blocked: true, high: 2, medium: 3, low: 1 }

// Access findings
result.findings.forEach(finding => {
  console.log(finding.id, finding.copy);
});
```

## Roadmap

- [x] Expo/React Native scanner
- [x] AST scanning for runtime detection
- [x] 24 store policy rules
- [x] Screenshot normalization
- [x] HTML report generation
- [x] Submission Pack ZIP export
- [ ] Flutter scanner
- [ ] CLI tool
- [ ] CI/CD integration
- [ ] Desktop app (Tauri)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## License

MIT © StorePreflight

---

**Built for developers who hate surprises.**
