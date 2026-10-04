// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import { parseFlowMap, recognizeMappedScreen } from '../packages/registry/src/flow-map';

const map = JSON.parse(readFileSync('docs/fue/flow-map.json', 'utf8'));

afterEach(() => {
  Reflect.deleteProperty(document, 'URL');
  vi.restoreAllMocks();
});

it('reconoce solo la pantalla pública de identificación y no ofrece acciones automáticas', () => {
  const parsed = parseFlowMap(map);
  expect(parsed.screens).toHaveLength(1);
  expect(parsed.screens[0]?.transitions).toEqual([]);
  Object.defineProperty(document, 'URL', {
    configurable: true,
    value: 'https://paeelectronico.circe.es/Account/LoginVirtual?id=10240',
  });
  document.body.innerHTML =
    '<form action="https://paeelectronico.circe.es/Account/LoginVirtual" method="post"><button id="send" type="submit"><em></em> Login Cl@ve</button></form>';
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body);
  expect(recognizeMappedScreen(map, document)).toBe('public-clave-login');

  Object.defineProperty(document, 'URL', {
    configurable: true,
    value: 'https://paeelectronico.circe.es/Account/Private',
  });
  expect(() => recognizeMappedScreen(map, document)).toThrow('Unknown or ambiguous screen');
});
