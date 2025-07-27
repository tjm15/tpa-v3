# Planners Assistant Demo

A **planner-first, local-first AI assistant** that runs mostly inside the browser, leverages free/open data, and requires only a lightweight "easy login" (user-supplied API key) for optional LLM features.

## Features

- **Local-first**: All processing happens in your browser
- **PDF Processing**: Extract and chunk planning documents
- **Semantic Search**: Find relevant content using local embeddings
- **Spatial Analysis**: Analyze development sites against constraints
- **AI Integration**: Optional Gemini API integration for enhanced Q&A
- **No Backend Required**: Runs entirely on static hosting

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:5173

## Architecture

- **Frontend**: Svelte + TypeScript + Vite
- **Storage**: Dexie (IndexedDB wrapper)
- **PDF Processing**: PDF.js
- **Embeddings**: Transformers.js (local inference)
- **Vector Database**: In-memory with cosine similarity
- **Spatial Analysis**: Turf.js
- **Optional LLM**: Google Gemini API (user-provided key)

## Usage

### 1. Upload Planning Documents

- Click "Upload Plan PDF" in the Policy mode
- Processing happens locally in your browser
- Text is extracted, chunked, and embedded automatically

### 2. Search and Analyze

- Use the search bar to find relevant policy content
- Results are ranked by semantic similarity
- No data leaves your browser

### 3. Site Assessment

- Switch to Site mode to analyze development sites
- View constraints and deliverability metrics
- Interactive mapping (placeholder for MapLibre integration)

### 4. AI Questions (Optional)

- Add your Gemini API key in Settings
- Ask questions about your planning documents
- Get contextual answers with citations

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is configured for deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Access your deployed app at `https://yourusername.github.io/repository-name`

## Privacy & Security

- All document processing happens locally
- No data is sent to external servers (except optional LLM API)
- IndexedDB storage is private to your browser
- API keys are stored locally and never transmitted

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires modern browser with WebAssembly support

## Technical Details

### File Structure

```
src/
├── lib/
│   ├── db/           # Database layer (Dexie)
│   ├── embeddings/   # Local embeddings (Transformers.js)
│   ├── pdf/          # PDF processing (PDF.js)
│   ├── spatial/      # Spatial analysis (Turf.js)
│   ├── llm/          # LLM integration (Gemini)
│   └── utils/        # Utility functions
├── routes/           # Svelte components
└── styles/           # CSS and styling
```

### Key Technologies

- **Svelte 5**: Component framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **PDF.js**: PDF text extraction
- **Transformers.js**: Local ML inference
- **Turf.js**: Spatial calculations
- **Dexie**: IndexedDB wrapper
- **Tailwind CSS**: Styling framework

## License

MIT License
