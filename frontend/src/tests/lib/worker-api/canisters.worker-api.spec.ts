import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import { queryCanisterDetails } from "$lib/worker-api/canisters.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
import type { CanisterStatusResponse } from "@dfinity/ic-management";

jest.mock("@dfinity/agent/lib/cjs/index");

describe("canisters-worker-api", () => {
  const response: CanisterStatusResponse = {
    status: { running: null },
    memory_size: BigInt(1000),
    cycles: BigInt(10_000),
    settings: {
      controllers: [],
      freezing_threshold: 0n,
      memory_allocation: 10n,
      compute_allocation: 5n,
    },
    module_hash: [],
  };

  const MockHttpAgent = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await import("@dfinity/agent/lib/cjs/index");
    module.HttpAgent = MockHttpAgent;
    module.getManagementCanister = jest.fn().mockReturnValue({
      canister_status: async () => response,
    });
  });

  describe("queryCanisterDetails", () => {
    it("should call IC Management Canister with canister id", async () => {
      const host = "http://localhost:8000";
      const result = await queryCanisterDetails({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id.toText(),
        host,
        fetchRootKey: false,
      });

      expect(result).toEqual({
        id: mockCanisterDetails.id,
        status: CanisterStatus.Running,
        memorySize: 1000n,
        cycles: 10000n,
        settings: {
          controllers: [],
          freezingThreshold: 0n,
          memoryAllocation: 10n,
          computeAllocation: 5n,
        },
        moduleHash: undefined,
      });
    });
  });
});
