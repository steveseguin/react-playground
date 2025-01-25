# React Playground

A lightweight, browser-based React code playground that runs JSX without compilation steps. Write, preview, and test React components directly in your browser with zero setup.

## Features

- Live React component preview
- JSX support with Babel transformation
- No build step or compilation required
- Dark theme interface
- Error reporting
- Toggle between code and preview
- Single HTML file deployment

## Usage

1. Clone the repository or download `index.html`
2. Open `index.html` in your browser
3. Start writing React code in the editor
4. Click "Run" to execute your code
5. Use "Toggle View" to switch between code and preview

## Example Code

```jsx
function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', color: '#e0e0e0' }}>
      <h1>Hello React!</h1>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          background: '#4CAF50',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Count: {count}
      </button>
    </div>
  );
}
```

## Dependencies

The playground uses CDN-hosted dependencies:
- React 18.2.0
- ReactDOM 18.2.0
- Babel Standalone 7.23.5

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Custom Properties
- CSS Transforms
- localStorage (optional, for saving code)

## Contributing

Feel free to open issues and submit PRs for:
- Additional features
- Bug fixes
- UI improvements
- Documentation updates

## License

MIT License - See LICENSE file for details
