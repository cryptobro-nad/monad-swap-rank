import { describe, expect, it } from "vitest";
import {
  MOBULA_TRADES_MAX_PAGES,
  MOBULA_TRADES_PAGE_LIMIT,
  shouldFetchNextMobulaTradesPage
} from "../lib/providers/mobula-pagination";

describe("Mobula wallet trades pagination", () => {
  it("uses a bounded page budget for wallet trades", () => {
    expect(MOBULA_TRADES_PAGE_LIMIT).toBe(100);
    expect(MOBULA_TRADES_MAX_PAGES).toBe(10);
  });

  it("continues when a full page is returned and no stop signal is present", () => {
    expect(
      shouldFetchNextMobulaTradesPage({
        payload: {
          pagination: {
            pageEntries: MOBULA_TRADES_PAGE_LIMIT
          }
        },
        currentOffset: 0,
        pageLimit: MOBULA_TRADES_PAGE_LIMIT,
        normalizedSwapCount: MOBULA_TRADES_PAGE_LIMIT
      })
    ).toBe(true);
  });

  it("stops when Mobula reports fewer entries than the page limit", () => {
    expect(
      shouldFetchNextMobulaTradesPage({
        payload: {
          pagination: {
            pageEntries: 12
          }
        },
        currentOffset: 0,
        pageLimit: MOBULA_TRADES_PAGE_LIMIT,
        normalizedSwapCount: 12
      })
    ).toBe(false);
  });

  it("stops when Mobula reports the total has been reached", () => {
    expect(
      shouldFetchNextMobulaTradesPage({
        payload: {
          pagination: {
            pageEntries: 100,
            total: 200
          }
        },
        currentOffset: 100,
        pageLimit: MOBULA_TRADES_PAGE_LIMIT,
        normalizedSwapCount: 100
      })
    ).toBe(false);
  });

  it("stops when Mobula explicitly reports there is no next page", () => {
    expect(
      shouldFetchNextMobulaTradesPage({
        payload: {
          data: {
            pagination: {
              pageEntries: 100,
              hasNextPage: false
            }
          }
        },
        currentOffset: 0,
        pageLimit: MOBULA_TRADES_PAGE_LIMIT,
        normalizedSwapCount: 100
      })
    ).toBe(false);
  });
});
