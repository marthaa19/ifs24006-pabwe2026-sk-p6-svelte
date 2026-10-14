<script>
  import { onMount } from "svelte";
  import { useInput } from "../../../hooks/useInput.js";
  import {
    profile,
    loadProfile,
    updateProfile,
    updatePhoto,
    updatePassword,
  } from "../states/userStore.js";

  const { value: name } = useInput("");
  const { value: email } = useInput("");
  const { value: oldPassword, reset: resetOld } = useInput("");
  const { value: newPassword, reset: resetNew } = useInput("");
  let photoFile = $state(null);

  onMount(loadProfile);

  // isi form setiap kali data profil berubah
  $effect(() => {
    if ($profile) {
      name.set($profile.name);
      email.set($profile.email);
    }
  });

  const handleProfile = (e) => {
    e.preventDefault();
    updateProfile($name, $email);
  };

  const handlePhoto = async (e) => {
    e.preventDefault();
    if (photoFile) await updatePhoto(photoFile);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    const ok = await updatePassword($oldPassword, $newPassword);
    if (ok) {
      resetOld();
      resetNew();
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const btnClass =
    "rounded-lg bg-indigo-600 text-white font-semibold px-4 py-2 hover:bg-indigo-700";
</script>

<h1 class="text-2xl font-bold mb-4">Profil</h1>

<div class="grid gap-6 lg:grid-cols-3">
  <form onsubmit={handleProfile} class="bg-white rounded-xl shadow-sm p-5 space-y-3">
    <h2 class="font-semibold">Ubah Data</h2>
    <div>
      <label for="p-name" class="block text-sm mb-1">Nama</label>
      <input id="p-name" class={inputClass} bind:value={$name} required />
    </div>
    <div>
      <label for="p-email" class="block text-sm mb-1">Email</label>
      <input id="p-email" type="email" class={inputClass} bind:value={$email} required />
    </div>
    <button class={btnClass}>Simpan</button>
  </form>

  <form onsubmit={handlePhoto} class="bg-white rounded-xl shadow-sm p-5 space-y-3">
    <h2 class="font-semibold">Ubah Foto</h2>
    {#if $profile?.photo}
      <img src={$profile.photo} alt="Foto profil" class="w-20 h-20 rounded-full object-cover" />
    {/if}
    <input type="file" accept="image/*" class={inputClass}
      onchange={(e) => (photoFile = e.target.files[0] ?? null)} />
    <button class={btnClass}>Unggah</button>
  </form>

  <form onsubmit={handlePassword} class="bg-white rounded-xl shadow-sm p-5 space-y-3">
    <h2 class="font-semibold">Ubah Kata Sandi</h2>
    <div>
      <label for="p-old" class="block text-sm mb-1">Kata sandi lama</label>
      <input id="p-old" type="password" class={inputClass} bind:value={$oldPassword} required />
    </div>
    <div>
      <label for="p-new" class="block text-sm mb-1">Kata sandi baru</label>
      <input id="p-new" type="password" class={inputClass} bind:value={$newPassword} required />
    </div>
    <button class={btnClass}>Ubah</button>
  </form>
</div>
