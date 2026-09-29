declare module "asciinema-player" {
  export type AsciinemaPlayerHandle = {
    dispose: () => void;
  };

  export function create(
    src: string | { url: string } | { data: string | object },
    container: HTMLElement,
    opts?: Record<string, unknown>,
  ): AsciinemaPlayerHandle;
}
