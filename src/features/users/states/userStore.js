import { writable } from "svelte/store";
import {
  getUsers,
  getMe,
  putMe,
  postPhoto,
  putPassword,
} from "../api/userApi.js";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper.js";

export const users = writable([]);
export const profile = writable(null);
export const isUserLoading = writable(false);

export async function loadUsers() {
  isUserLoading.set(true);
  try {
    const res = await getUsers();
    users.set(res.data.users);
  } catch (error) {
    await showErrorDialog(error.message);
  } finally {
    isUserLoading.set(false);
  }
}

export async function loadProfile() {
  try {
    const res = await getMe();
    profile.set(res.data.user);
  } catch (error) {
    await showErrorDialog(error.message);
  }
}

async function mutate(action, successFallback) {
  try {
    const res = await action();
    await showSuccessDialog(res.message || successFallback);
    await loadProfile();
    return true;
  } catch (error) {
    await showErrorDialog(error.message);
    return false;
  }
}

export const updateProfile = (name, email) =>
  mutate(() => putMe({ name, email }), "Profil berhasil diubah");

export const updatePhoto = (file) =>
  mutate(() => postPhoto(file), "Foto berhasil diubah");

export const updatePassword = (password, new_password) =>
  mutate(() => putPassword({ password, new_password }), "Kata sandi berhasil diubah");
