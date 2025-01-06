<script>
  import "../app.postcss";
  import { Button } from "$lib/components/ui/button";

  let darkMode = false;

  function toggleDarkMode() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle("dark");
  }
</script>

<div class={`min-h-screen bg-background ${darkMode ? "dark" : ""}`}>
  <div class="absolute top-4 right-4">
    <Button variant="outline" size="icon" on:click={toggleDarkMode}>
      {#if darkMode}
        🌞
      {:else}
        🌙
      {/if}
    </Button>
  </div>
  <slot />
</div>
