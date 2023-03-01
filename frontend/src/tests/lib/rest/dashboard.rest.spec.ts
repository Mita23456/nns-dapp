import { fetchTransactionRate } from "$lib/rest/dashboard.rest";
import type { DashboardMessageExecutionRateResponse } from "$lib/types/dashboard";

describe("Dashboard Rest API", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("should fetch a transaction rate", async () => {
    const data: DashboardMessageExecutionRateResponse = {
      message_execution_rate: [[1234, 300]],
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(data),
        ok: true,
        status: 200,
      })
    );

    const rate = await fetchTransactionRate();

    expect(rate.message_execution_rate).toEqual(data.message_execution_rate);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if return code invalid", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
      })
    );

    const rate = await fetchTransactionRate();

    expect(rate).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should return null if endpoint throws an exception", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore mock fetch
    global.fetch = jest.fn(() => Promise.reject("An API error"));

    const rate = await fetchTransactionRate();

    expect(rate).toBeNull();

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
