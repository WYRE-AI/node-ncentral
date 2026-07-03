/** Sorting direction accepted by the N-central API (case insensitive). */
export type SortOrder =
  | 'asc'
  | 'ascending'
  | 'natural'
  | 'desc'
  | 'descending'
  | 'reverse'
  | 'ASC'
  | 'ASCENDING'
  | 'NATURAL'
  | 'DESC'
  | 'DESCENDING'
  | 'REVERSE';

/** Standard pagination/sorting/field-selection query parameters. */
export interface PaginationParams {
  /** 1-based page number. Default: 1. */
  pageNumber?: number;
  /** Items per page, 1–1000 (server max with -1). Default: 50. */
  pageSize?: number;
  /** Field name to sort the results by. */
  sortBy?: string;
  /** Sorting direction. Default: ASC. */
  sortOrder?: SortOrder;
  /** Field-selection expression. */
  select?: string;
}

/** Page navigation links returned in the `_links` object. */
export interface PaginationLinks {
  firstPage?: string;
  previousPage?: string;
  nextPage?: string;
  lastPage?: string;
  [key: string]: string | undefined;
}

/**
 * The N-central paginated response envelope.
 *
 * Note: some list endpoints (the `ListResponse*` OpenAPI schemas) only
 * document `data` + `totalItems`; when the server omits `pageNumber` /
 * `pageSize` the client fills them from the request parameters (or their
 * documented defaults) so the envelope shape stays consistent.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  itemCount?: number;
  totalItems?: number;
  totalPages?: number;
  _links?: PaginationLinks;
  _warning?: string;
}

/**
 * Normalizes a raw list/query response body into a {@link PaginatedResponse}.
 * Preserves every envelope field the server sent and defensively defaults
 * `data`, `pageNumber` and `pageSize`.
 */
export function toPaginated<T>(
  raw: unknown,
  params?: PaginationParams,
): PaginatedResponse<T> {
  const envelope =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const data = Array.isArray(envelope.data)
    ? (envelope.data as T[])
    : Array.isArray(raw)
      ? (raw as T[])
      : [];

  return {
    ...envelope,
    data,
    pageNumber:
      typeof envelope.pageNumber === 'number'
        ? envelope.pageNumber
        : (params?.pageNumber ?? 1),
    pageSize:
      typeof envelope.pageSize === 'number'
        ? envelope.pageSize
        : (params?.pageSize ?? data.length),
  } as PaginatedResponse<T>;
}

/**
 * Defensively unwraps single-entity `{ data: {...} }` envelopes. Returns
 * the input unchanged when it is not wrapped.
 */
export function unwrap<T>(raw: unknown): T {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) {
    const data = (raw as { data?: unknown }).data;
    if (data !== null && data !== undefined && !Array.isArray(data)) {
      return data as T;
    }
  }
  return raw as T;
}
