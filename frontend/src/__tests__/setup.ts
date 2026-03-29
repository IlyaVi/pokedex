import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// Provide a working localStorage in jsdom
const localStorageStore: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key) => localStorageStore[key] ?? null,
  setItem: (key, value) => { localStorageStore[key] = String(value); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]); },
  key: (i) => Object.keys(localStorageStore)[i] ?? null,
  get length() { return Object.keys(localStorageStore).length; },
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  localStorageMock.clear();
});
afterAll(() => server.close());
