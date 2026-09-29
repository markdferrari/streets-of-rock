import { expect, it } from 'vitest';
import { preparationErrorMarkup } from '../../../src/ui/screens';

it('keeps the locked duo visible when preparation fails', () => {
  const html = preparationErrorMarkup({ fighterId: 'crow', partnerId: 'cow' }, 'WebGL failed');
  expect(html).toContain('Your Chieftain: Crow');
  expect(html).toContain('AI Partner: Cow');
  expect(html).toContain('Crow portrait');
  expect(html).toContain('Cow portrait');
  expect(html).toContain('WebGL failed');
  expect(html).toContain('data-command="retry"');
  expect(html).toContain('data-command="title"');
});
