import { describe, expect, it } from 'vitest';
import { toPaginated, unwrap } from '../src/pagination.js';

describe('toPaginated', () => {
  it('passes through a full QueryResponse envelope', () => {
    const raw = {
      data: [{ deviceId: 1 }],
      pageNumber: 3,
      pageSize: 25,
      itemCount: 1,
      totalItems: 51,
      totalPages: 3,
      _links: { firstPage: '/api/devices?pageNumber=1' },
      _warning: 'deprecated field selected',
    };

    const page = toPaginated<{ deviceId: number }>(raw, { pageNumber: 3, pageSize: 25 });

    expect(page.data).toEqual([{ deviceId: 1 }]);
    expect(page.pageNumber).toBe(3);
    expect(page.pageSize).toBe(25);
    expect(page.itemCount).toBe(1);
    expect(page.totalItems).toBe(51);
    expect(page.totalPages).toBe(3);
    expect(page._links).toEqual({ firstPage: '/api/devices?pageNumber=1' });
    expect(page._warning).toBe('deprecated field selected');
  });

  it('fills pageNumber/pageSize from request params for ListResponse envelopes', () => {
    const raw = { data: [{ a: 1 }, { a: 2 }], totalItems: 10 };
    const page = toPaginated(raw, { pageNumber: 2, pageSize: 2 });

    expect(page.pageNumber).toBe(2);
    expect(page.pageSize).toBe(2);
    expect(page.totalItems).toBe(10);
  });

  it('defaults pageNumber to 1 and pageSize to the item count when nothing is known', () => {
    const raw = { data: [{ a: 1 }, { a: 2 }, { a: 3 }] };
    const page = toPaginated(raw);

    expect(page.pageNumber).toBe(1);
    expect(page.pageSize).toBe(3);
  });

  it('tolerates a bare array response', () => {
    const page = toPaginated([{ a: 1 }]);
    expect(page.data).toEqual([{ a: 1 }]);
    expect(page.pageNumber).toBe(1);
  });

  it('tolerates a missing/empty body', () => {
    expect(toPaginated(undefined).data).toEqual([]);
    expect(toPaginated(null).data).toEqual([]);
    expect(toPaginated({}).data).toEqual([]);
  });
});

describe('unwrap', () => {
  it('unwraps a { data: {...} } envelope', () => {
    expect(unwrap<{ id: number }>({ data: { id: 1 }, _links: {} })).toEqual({ id: 1 });
  });

  it('returns unwrapped entities unchanged', () => {
    expect(unwrap<{ id: number }>({ id: 1 })).toEqual({ id: 1 });
  });

  it('does not unwrap when data is an array', () => {
    const raw = { data: [{ id: 1 }] };
    expect(unwrap(raw)).toBe(raw);
  });

  it('passes through primitives and null-ish values', () => {
    expect(unwrap(undefined)).toBeUndefined();
    expect(unwrap(null)).toBeNull();
    expect(unwrap('text')).toBe('text');
  });
});
