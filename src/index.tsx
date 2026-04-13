/**
 * CE.SDK 3D Product Configurator Starterkit - React Entry Point
 *
 * A mockup editor that renders designs on 3D product models in real-time.
 *
 * @see https://img.ly/docs/cesdk/js/getting-started/
 */

import type { Configuration } from '@cesdk/cesdk-js';
import { createRoot } from 'react-dom/client';
import App from './app/App';

// ============================================================================
// Configuration
// ============================================================================

const config: Configuration = {
  userId: 'starterkit-3d-product-preview-user'

  // Local assets
  // baseURL: `/assets/`,

  // License key (required for production)
  // license: 'YOUR_LICENSE_KEY',
};

// ============================================================================
// Render
// ============================================================================

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(<App config={config} />);
