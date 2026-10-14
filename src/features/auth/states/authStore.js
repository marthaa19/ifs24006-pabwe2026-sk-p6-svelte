import { writable, derived } from "svelte/store";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper.js";
import { postLogin, postRegister } from "../api/authApi.js";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper.js";

export const authToken = writable(getAccessToken());
export const isLoggedIn = derived(authToken, ($token) => Boolean($token));
export const isAuthLoading = writable(false);

export async function login(email, password) {
  isAuthLoading.set(true);
  try {
    const res = await postLogin({ email, password });
    putAccessToken(res.data.token);
    authToken.set(res.data.token);
    return true;
  } catch (error) {
    await showErrorDialog(error.message);
    return false;
  } finally {
    isAuthLoading.set(false);
  }
}

export async function register(name, email, password) {
  isAuthLoading.set(true);
  try {
    const res = await postRegister({ name, email, password });
    await showSuccessDialog(res.message);
    return true;
  } catch (error) {
    await showErrorDialog(error.message);
    return false;
  } finally {
    isAuthLoading.set(false);
  }
}

export function logout() {
  removeAccessToken();
  authToken.set(null);
}
