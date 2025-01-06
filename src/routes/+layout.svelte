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
  <header class="border-b">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="font-serif text-xl">Transkriber</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Beta</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Theme</span>
        <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
      </div>
    </div>
  </header>
  <main class="py-8">
    <slot />
  </main>
</div>
