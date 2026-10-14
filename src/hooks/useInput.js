import { writable } from "svelte/store";

/**
 * Hook input formulir berbasis Svelte store.
 *
 * Pemakaian di komponen:
 *   const { value: email, reset } = useInput("");
 *   <input bind:value={$email} />
 */
export function useInput(defaultValue = "") {
  const value = writable(defaultValue);
  const reset = () => value.set(defaultValue);
  return { value, reset };
}
