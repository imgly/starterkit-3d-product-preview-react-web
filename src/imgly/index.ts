/**
 * CE.SDK Mockup Utilities
 *
 * Reusable utilities for building mockup editors with CE.SDK.
 *
 * @example
 * ```typescript
 * import { renderMockup, initHeadlessEngine, CLEAR_IMAGE } from './imgly';
 *
 * // Initialize engine
 * const engine = await initHeadlessEngine({ license: 'YOUR_LICENSE' });
 *
 * // Render mockup with placeholders
 * const result = await renderMockup(engine, 'mockup.scene', {
 *   'Image 1': designBlob,
 *   'Image 2': CLEAR_IMAGE
 * });
 * ```
 */

import CreativeEditorSDK from '@cesdk/cesdk-js';
import {
  BlurAssetSource,
  ColorPaletteAssetSource,
  CropPresetsAssetSource,
  DemoAssetSources,
  EffectsAssetSource,
  FiltersAssetSource,
  PagePresetsAssetSource,
  StickerAssetSource,
  TextAssetSource,
  TextComponentAssetSource,
  TypefaceAssetSource,
  UploadAssetSources,
  VectorShapeAssetSource
} from '@cesdk/cesdk-js/plugins';

import { DesignEditorConfig } from './config/plugin';

// ============================================================================
// Re-exports
// ============================================================================

export { renderMockup, disposeMockupRenderer, CLEAR_IMAGE } from './mockup';

export type {
  HeadlessEngineConfig,
  Placeholders,
  RenderMockupOptions,
  RenderResult,
  SceneSource
} from './types';

// ============================================================================
// Editor Initialization
// ============================================================================

/**
 * Initializes CE.SDK for the main design editor (Creator role).
 */
export async function initDesignEditor(
  cesdk: CreativeEditorSDK
): Promise<void> {
  await cesdk.addPlugin(new DesignEditorConfig());

  // Asset sources
  await cesdk.addPlugin(new ColorPaletteAssetSource());
  await cesdk.addPlugin(new TypefaceAssetSource());
  await cesdk.addPlugin(new TextAssetSource());
  await cesdk.addPlugin(new TextComponentAssetSource());
  await cesdk.addPlugin(new StickerAssetSource());
  await cesdk.addPlugin(new VectorShapeAssetSource());
  await cesdk.addPlugin(new FiltersAssetSource());
  await cesdk.addPlugin(new EffectsAssetSource());
  await cesdk.addPlugin(new BlurAssetSource());
  await cesdk.addPlugin(new CropPresetsAssetSource());
  await cesdk.addPlugin(new PagePresetsAssetSource());
  await cesdk.addPlugin(new UploadAssetSources());
  await cesdk.addPlugin(
    new DemoAssetSources({
      include: [
        'ly.img.image.*',
        'ly.img.templates.blank.*',
        'ly.img.templates.presentation.*',
        'ly.img.templates.print.*',
        'ly.img.templates.social.*'
      ]
    })
  );

  cesdk.ui.setTheme('light');
  cesdk.engine.editor.setRole('Creator');

  // Disable features not needed
  cesdk.feature.set('ly.img.placeholder', false);
  cesdk.feature.set('ly.img.preview', false);
  cesdk.feature.set('ly.img.page.resize', false);
  cesdk.feature.set('ly.img.options', false);

  // Remove templates from dock
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.dock' },
    cesdk.ui
      .getComponentOrder({ in: 'ly.img.dock' })
      .filter(({ key }) => key !== 'ly.img.templates')
  );

  // Configure actions dropdown
  cesdk.ui.insertOrderComponent(
    { in: 'ly.img.navigation.bar', position: 'end' },
    {
      id: 'ly.img.actions.navigationBar',
      children: [
        'ly.img.exportImage.navigationBar',
        'ly.img.exportPDF.navigationBar'
      ]
    }
  );

  cesdk.i18n.setTranslations({
    en: {
      'libraries.empty.images': 'Add your own images.',
      'libraries.empty.uploads': 'Drop images here or click to upload.'
    }
  });
}
