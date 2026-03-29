import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "@/hooks/useTheme";

function mockMatchMedia(dark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: dark && query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  // localStorage is cleared in global setup afterEach
});

describe("useTheme", () => {
  it("defaults to dark when system prefers dark", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("defaults to light when system prefers light", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("toggle switches from light to dark", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
  });

  it("toggle switches from dark to light", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");
  });

  it("persists theme choice to localStorage", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(localStorage.getItem("theme")).toBe('"dark"');
  });

  it("restores from localStorage overriding system preference", () => {
    localStorage.setItem("theme", '"light"');
    mockMatchMedia(true); // system says dark
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("adds dark class to documentElement when dark", () => {
    mockMatchMedia(true);
    renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when switching to light", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    act(() => result.current.toggle());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
