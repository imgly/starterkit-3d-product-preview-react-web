/**
 * CE.SDK 3D Mockup Editor - Main Application Component
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import CreativeEditor from '@cesdk/cesdk-js/react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { Configuration } from '@cesdk/cesdk-js';

import { initDesignEditor, disposeMockupRenderer } from '../imgly';
import { downloadMockup } from './utils';
import { resolveAssetPath } from './resolveAssetPath';
import { useMockupRenderer } from './hooks/useMockupRenderer';
import { Topbar } from './Topbar/Topbar';
import { Mockup3DPreview } from './Mockup3DPreview/Mockup3DPreview';
import { PRODUCTS, getDesignSceneUrl, getModelUrl } from './constants';
import styles from './App.module.css';

// Default product to load on startup
const DEFAULT_PRODUCT_KEY = 'businesscard';

interface AppProps {
  config: Configuration;
}

export default function App({ config }: AppProps) {
  const designEngineRef = useRef<CreativeEditorSDK | null>(null);

  const [currentProductKey, setCurrentProductKey] =
    useState(DEFAULT_PRODUCT_KEY);
  const [isProductSwitching, setIsProductSwitching] = useState(false);

  // Mockup rendering - engine is lazily initialized inside renderMockup
  const {
    mockupImageUrl,
    isLoading,
    setEngineReady,
    renderMockupForProduct,
    resetMockupScene
  } = useMockupRenderer({ designEngineRef, config });

  // Use refs to keep callbacks stable for handleEditorInit
  const renderMockupForProductRef = useRef(renderMockupForProduct);
  renderMockupForProductRef.current = renderMockupForProduct;

  const setEngineReadyRef = useRef(setEngineReady);
  setEngineReadyRef.current = setEngineReady;

  // ============================================================================
  // Product Switching
  // ============================================================================

  const handleProductChange = useCallback(
    async (productKey: string) => {
      const designEngine = designEngineRef.current;
      if (!designEngine || productKey === currentProductKey) return;

      setIsProductSwitching(true);
      setCurrentProductKey(productKey);
      resetMockupScene();

      try {
        const sceneUrl = getDesignSceneUrl(productKey);
        await designEngine.engine.scene.loadFromURL(sceneUrl);
        await renderMockupForProduct(productKey, undefined);
      } finally {
        setIsProductSwitching(false);
      }
    },
    [currentProductKey, renderMockupForProduct, resetMockupScene]
  );

  // ============================================================================
  // Download
  // ============================================================================

  const handleDownload = useCallback(() => {
    if (!mockupImageUrl) return;
    downloadMockup(mockupImageUrl, currentProductKey);
  }, [mockupImageUrl, currentProductKey]);

  // ============================================================================
  // Editor Initialization
  // ============================================================================

  // Stable callback that doesn't change - uses refs for latest values
  const handleEditorInit = useCallback(
    async (cesdk: CreativeEditorSDK) => {
      designEngineRef.current = cesdk;

      await initDesignEditor(cesdk);

      // Load initial design scene from remote CDN
      const initialSceneUrl = getDesignSceneUrl(DEFAULT_PRODUCT_KEY);
      await cesdk.loadFromURL(initialSceneUrl);

      // Signal that engine is ready for history subscriptions
      setEngineReadyRef.current();

      // Render initial mockup (engine initializes lazily on first render)
      await renderMockupForProductRef.current(DEFAULT_PRODUCT_KEY);
    },
    [] // Empty deps - uses refs for latest callbacks
  );

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      disposeMockupRenderer();
    };
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  const product = PRODUCTS[currentProductKey];

  return (
    <div className={styles.app}>
      <Topbar
        currentProductKey={currentProductKey}
        onProductChange={handleProductChange}
        disabled={isProductSwitching}
      />

      <div className={styles.mainLayout}>
        <Mockup3DPreview
          mockupImageUrl={mockupImageUrl}
          modelUrl={resolveAssetPath(getModelUrl(currentProductKey))}
          cameraOrbit={product.cameraOrbit}
          baseColorTextureIndex={product.baseColorTextureIndex}
          isLoading={isLoading}
          onDownload={handleDownload}
        />

        <div className={styles.editorWrapper}>
          <CreativeEditor
            className={styles.editor}
            config={config}
            init={handleEditorInit}
          />
        </div>
      </div>
    </div>
  );
}
