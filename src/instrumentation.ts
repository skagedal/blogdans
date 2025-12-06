export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { serverStartup } = await import("./instrumentation-node");
    await serverStartup();
  }
}
