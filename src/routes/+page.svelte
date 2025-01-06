<script>
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { marked } from "marked";

  let audioFile = null;
  let audioElement;
  let transcription = "";
  let isTranscribing = false;
  let progress = 0;
  let showMarkdown = false;

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "audio/mpeg") {
      audioFile = file;

      // Create a new audio element if it doesn't exist
      if (!audioElement) {
        audioElement = new Audio();
      }

      // Revoke previous URL if it exists to prevent memory leaks
      if (audioElement.src) {
        URL.revokeObjectURL(audioElement.src);
      }

      const url = URL.createObjectURL(file);
      audioElement.src = url;

      // Set up event listeners
      audioElement.addEventListener("loadedmetadata", () => {
        console.log("Audio metadata loaded, duration:", audioElement.duration);
      });

      audioElement.addEventListener("error", (e) => {
        console.error("Error loading audio:", e);
      });

      // Force the audio to load
      try {
        await audioElement.load();
      } catch (error) {
        console.error("Error loading audio:", error);
      }
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

      // Call Gemini API with the audio file included
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
          }),
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

<div class="container mx-auto p-4">
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Transkriber</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="flex flex-col gap-2">
          <input
            type="file"
            accept="audio/mpeg"
            on:change={handleFileUpload}
            class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />

          {#if audioFile}
            <div class="flex flex-col gap-2">
              <audio bind:this={audioElement} controls preload="metadata" class="w-full">
                <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          {/if}
        </div>

        <Button on:click={transcribeAudio} disabled={!audioFile || isTranscribing}>
          {isTranscribing ? "Transcribing..." : "Transcribe Audio"}
        </Button>

        {#if isTranscribing}
          <Progress value={progress} />
        {/if}

        {#if transcription}
          <div class="flex gap-2 items-center">
            <span class="text-sm">View as:</span>
            <Button variant="outline" size="sm" on:click={togglePreview}>
              {showMarkdown ? "Plain Text" : "Markdown"}
            </Button>
          </div>

          <div class="mt-4 p-4 bg-muted rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto scrollbar">
            {#if showMarkdown}
              {@html getMarkdownPreview()}
            {:else}
              {transcription}
            {/if}
          </div>

          <div class="flex gap-2">
            <Button variant="outline" on:click={() => exportTranscription("txt")}>Export as TXT</Button>
            <Button variant="outline" on:click={() => exportTranscription("md")}>Export as MD</Button>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>

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
    font-weight: bold;
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
