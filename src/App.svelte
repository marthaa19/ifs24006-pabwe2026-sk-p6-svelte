<script>
  import { currentPath, navigate, resolveRoute } from "./router.js";
  import { authToken } from "./features/auth/states/authStore.js";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LoginPage from "./features/auth/pages/LoginPage.svelte";
  import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
  import HomePage from "./features/linktrees/pages/HomePage.svelte";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

  const pages = {
    login: LoginPage,
    register: RegisterPage,
    home: HomePage,
    notFound: NotFoundPage,
  };

  let route = $derived(resolveRoute($currentPath));
  let Page = $derived(pages[route.name]);

  // Penjaga rute: belum login -> /auth/login, sudah login -> keluar dari halaman auth
  $effect(() => {
    if (route.layout === "none") return;
    if (route.layout === "auth" && $authToken) navigate("/", { replace: true });
    else if (route.layout !== "auth" && !$authToken)
      navigate("/auth/login", { replace: true });
  });
</script>

{#if route.layout === "auth"}
  <AuthLayout>
    <Page />
  </AuthLayout>
{:else}
  <Page {...route.params} />
{/if}
