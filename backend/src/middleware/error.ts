export function errorHandler(err: Error, _req: any, res: any, _next: any) {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Server error" });
}
