import { fetchApi } from "../../../helpers/apiHelper.js";

export function postLogin({ email, password }) {
  return fetchApi("/auth/login", { method: "POST", body: { email, password } });
}

export function postRegister({ name, email, password }) {
  return fetchApi("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}
