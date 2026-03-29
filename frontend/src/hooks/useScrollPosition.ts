import { useLocalStorage } from "react-use";

// Stores the index of the first visible pokemon row, not a pixel offset.
// Index-based restore is reliable: scrollToIndex works without pixel math
// and survives viewport/font-size changes.
export function useScrollPosition() {
  const [savedIndex, setSavedIndex] = useLocalStorage<number>("visible-index", 0);
  return { savedIndex: savedIndex ?? 0, setSavedIndex };
}
