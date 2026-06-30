import { afterEach, describe, expect, it, vi } from "vitest";

import { copyTextToClipboard } from "~/lib/clipboard";

describe("copyTextToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty text", async () => {
    await expect(copyTextToClipboard("   ")).rejects.toThrow("Nothing to copy.");
  });

  it("falls back to execCommand when clipboard API fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("blocked")),
      },
    });
    const execCommand = vi.spyOn(document, "execCommand").mockReturnValue(true);

    await copyTextToClipboard("flowchart TD\nA-->B");

    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});