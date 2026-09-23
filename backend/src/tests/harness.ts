/** Shared, mutable state describing how the test DB was started. */
export const harness = {
  /** True when the in-memory MongoDB was started as a replica set (transactions available). */
  transactions: false,
  uri: '',
};
