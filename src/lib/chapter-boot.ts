// Hook-free so the server layout can import it. See src/lib/chapter.ts for the chapter contract.

export const CHAPTER_KEY = "xc:chapter";

/** Inline, pre-paint: sets data-chapter from storage so there is no flash of the wrong chapter. */
export const CHAPTER_BOOT_SCRIPT = `try{document.documentElement.dataset.chapter=localStorage.getItem("${CHAPTER_KEY}")==="2"?"2":"1"}catch(e){document.documentElement.dataset.chapter="1"}`;
