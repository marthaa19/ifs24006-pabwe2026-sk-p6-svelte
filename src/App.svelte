<script>
  import { currentPath, navigate, resolveRoute } from "./router.js";
  import { authToken } from "./features/auth/states/authStore.js";
  import AuthLayout from "./features/auth/layouts/AuthLayout.svelte";
  import LoginPage from "./features/auth/pages/LoginPage.svelte";
  import RegisterPage from "./features/auth/pages/RegisterPage.svelte";
  import LinkTreeLayout from "./features/linktrees/layouts/LinkTreeLayout.svelte";
  import HomePage from "./features/linktrees/pages/HomePage.svelte";
  import DetailPage from "./features/linktrees/pages/DetailPage.svelte";
  import UsersPage from "./features/users/pages/UsersPage.svelte";
  import ProfilePage from "./features/users/pages/ProfilePage.svelte";
  import NotFoundPage from "./features/common/pages/NotFoundPage.svelte";

  const pages = {
    login: LoginPage,
    register: RegisterPage,
    home: HomePage,
    linkTreeDetail: DetailPage,
    users: UsersPage,
    profile: ProfilePage,
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
{:else if route.layout === "app"}
  <!-- layout aplikasi hanya dirender bila sudah login, agar tidak memanggil API tanpa token -->
  {#if $authToken}
    <LinkTreeLayout>
      <Page {...route.params} />
    </LinkTreeLayout>
  {/if}
{:else}
  <Page />
{/if}
