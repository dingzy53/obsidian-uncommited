import { browser, expect } from '@wdio/globals';
import { describe, it } from 'mocha';

describe('Uncommitted E2E', function () {
  it('loads the uncommitted plugin cleanly', async function () {
    const enabled = await browser.executeObsidian(({ app }) => {
      const plugins = (app as unknown as { plugins: { enabledPlugins: Set<string> } }).plugins;
      return plugins.enabledPlugins.has('uncommitted');
    });
    expect(enabled).toBe(true);
  });

  it('opens the changes list view gracefully even in a non-git vault', async function () {
    await browser.executeObsidianCommand('uncommitted:open-changes-list');

    await browser.waitUntil(
      async () =>
        browser.executeObsidian(({ app }) => {
          return app.workspace.getLeavesOfType('uncommitted-changes-view').length > 0;
        }),
      { timeout: 10_000, timeoutMsg: 'Expected uncommitted-changes-view leaf to open' },
    );

    const viewText = await browser.executeObsidian(({ app }) => {
      const leaf = app.workspace.getLeavesOfType('uncommitted-changes-view')[0];
      return leaf?.view.containerEl.textContent ?? '';
    });
    expect(viewText.length).toBeGreaterThan(0);
  });

  it('toggles editor diff markers via command', async function () {
    const before = await browser.executeObsidian(({ app }) => {
      const plugin = (app as unknown as { plugins: { plugins: Record<string, { settings: { showMarkers: boolean } }> } }).plugins.plugins['uncommitted'];
      return plugin?.settings.showMarkers;
    });

    await browser.executeObsidianCommand('uncommitted:toggle-markers');

    const after = await browser.executeObsidian(({ app }) => {
      const plugin = (app as unknown as { plugins: { plugins: Record<string, { settings: { showMarkers: boolean } }> } }).plugins.plugins['uncommitted'];
      return plugin?.settings.showMarkers;
    });
    expect(typeof before).toBe('boolean');
    expect(after).toBe(!before);
  });
});
