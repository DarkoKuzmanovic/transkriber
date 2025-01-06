<script>
  import "../app.postcss";
  import { Switch } from "$lib/components/ui/switch";
  import { onMount } from "svelte";

  let darkMode = false;

  onMount(() => {
    // Check stored preference
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      darkMode = true;
      document.documentElement.classList.add("dark");
    } else if (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // Check system preference if no stored preference
      darkMode = true;
      document.documentElement.classList.add("dark");
    }
  });

  function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }
</script>

<div class={`min-h-screen bg-background ${darkMode ? "dark" : ""}`}>
  <div class="absolute top-4 right-4 flex items-center gap-2">
    <span class="text-sm">Theme</span>
    <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
  </div>
  <slot />
</div>
