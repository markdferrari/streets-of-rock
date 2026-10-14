export function diagnosticsPayload(value: unknown): string {
  return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2);
}
export function downloadDiagnostics(value: unknown): void {
  const payload = diagnosticsPayload(value);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'streets-of-rock-diagnostics.json';
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
