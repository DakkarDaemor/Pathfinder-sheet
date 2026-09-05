/** Triggers a browser download of `data` as a JSON file named `fileName`. */
export function downloadJson(data: unknown, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Opens the browser's file picker and resolves with the parsed JSON of the chosen file. */
export function pickAndReadJsonFile(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error("Nessun file selezionato."));
        return;
      }
      file
        .text()
        .then((text) => resolve(JSON.parse(text)))
        .catch(reject);
    };
    input.click();
  });
}
