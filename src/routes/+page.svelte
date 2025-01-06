<script>
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { marked } from "marked";

  let audioFile = null;
  let audioElement;
  let transcription = "";
  let isTranscribing = false;
  let progress = 0;
  let showMarkdown = false;

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

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

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "audio/mpeg") {
      audioFile = file;

      if (!audioElement) {
        audioElement = new Audio();
      }
      if (audioElement.src) {
        URL.revokeObjectURL(audioElement.src);
      }

      const url = URL.createObjectURL(file);
      audioElement.src = url;
      await audioElement.load();
    }
  }

  async function transcribeAudio() {
    if (!audioFile) return;

    isTranscribing = true;
    progress = 0;

    try {
      // Convert audio to base64
      const base64Audio = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioFile);
      });

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: "Generate audio diarization, including transcriptions and speaker information for each transcription, for this interview. Organize the transcription by the time they happened.",
              },
              {
                inline_data: {
                  mime_type: "audio/mpeg",
                  data: base64Audio,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }
      transcription = data.candidates?.[0]?.content?.parts?.[0]?.text || "No transcription generated";
    } catch (error) {
      console.error("Transcription error:", error);
      transcription = "Error transcribing audio: " + error.message;
    } finally {
      isTranscribing = false;
      progress = 100;
    }
  }

  function getMarkdownPreview() {
    return marked.parse(transcription);
  }

  function togglePreview() {
    showMarkdown = !showMarkdown;
  }

  function exportTranscription(format) {
    if (!transcription) return;

    let content = transcription;
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "md") {
      content = `# Transcription\n\n${transcription}`;
      mimeType = "text/markdown";
      extension = "md";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="container mx-auto px-4">
  <div class="max-w-2xl mx-auto">
    <div class="space-y-8">
      <!-- Upload Section -->
      <Card>
        <CardContent class="pt-6">
          <div class="space-y-4">
            <h2 class="font-serif text-xl">Upload Audio</h2>
            <p class="text-sm text-muted-foreground">Upload an MP3 file to get started with transcription.</p>
            <input
              type="file"
              accept="audio/mpeg"
              on:change={handleFileUpload}
              class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Audio Player -->
      {#if audioFile}
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-4">
              <h2 class="font-serif text-xl">Preview Audio</h2>
              <audio bind:this={audioElement} controls preload="metadata" class="w-full">
                <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </CardContent>
        </Card>
      {/if}

      <!-- Transcribe Button -->
      <div class="flex justify-center">
        <Button class="px-8" size="lg" on:click={transcribeAudio} disabled={!audioFile || isTranscribing}>
          {#if isTranscribing}
            Transcribing...
          {:else}
            Start Transcription
          {/if}
        </Button>
      </div>

      <!-- Loading State -->
      {#if isTranscribing}
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-6">
              <div class="space-y-2">
                <h2 class="font-serif text-xl">Processing...</h2>
                <Progress value={progress} class="h-2" />
              </div>
              <div class="space-y-3">
                <Skeleton class="h-4 w-[250px]" />
                <Skeleton class="h-4 w-[200px]" />
                <Skeleton class="h-4 w-[300px]" />
                <Skeleton class="h-4 w-[280px]" />
                <Skeleton class="h-4 w-[270px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      {/if}

      <!-- Transcription Result -->
      {#if transcription}
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="font-serif text-xl">Transcription</h2>
                <div class="flex items-center gap-2">
                  <Button variant="outline" size="sm" on:click={togglePreview}>
                    {showMarkdown ? "Plain Text" : "Markdown"}
                  </Button>
                  <Button variant="outline" size="sm" on:click={() => exportTranscription("txt")}>Export TXT</Button>
                  <Button variant="outline" size="sm" on:click={() => exportTranscription("md")}>Export MD</Button>
                </div>
              </div>

              <div class="mt-4 p-4 bg-muted rounded-lg whitespace-pre-wrap max-h-[500px] overflow-y-auto scrollbar">
                {#if showMarkdown}
                  {@html getMarkdownPreview()}
                {:else}
                  {transcription}
                {/if}
              </div>
            </div>
          </CardContent>
        </Card>
      {/if}
    </div>
  </div>
</div>

<footer class="container mx-auto px-4 py-8 mt-8 text-center text-sm text-muted-foreground border-t">
  <div class="flex items-center justify-center gap-2">
    <span>© 2024 Transkriber</span>
    <span>•</span>
    <a href="https://github.com/DarkoKuzmanovic/transkriber" class="hover:text-foreground transition-colors">GitHub</a>
    <span>•</span>
    <span>v{import.meta.env.VITE_APP_VERSION || "0.5.0"}</span>
  </div>
</footer>

<style>
  :global(.scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground)) transparent;
  }

  :global(.scrollbar::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.scrollbar::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.scrollbar::-webkit-scrollbar-thumb) {
    background-color: hsl(var(--muted-foreground));
    border-radius: 4px;
  }

  :global(h1, h2, h3, h4, h5, h6) {
    margin: 1em 0 0.5em 0;
    font-weight: normal;
    font-family: theme("fontFamily.serif");
  }

  :global(p) {
    margin: 0.5em 0;
  }

  :global(ul, ol) {
    margin: 0.5em 0;
    padding-left: 2em;
  }

  :global(blockquote) {
    border-left: 4px solid hsl(var(--muted-foreground));
    margin: 0.5em 0;
    padding-left: 1em;
  }
</style>
