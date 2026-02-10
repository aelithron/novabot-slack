export async function getUniversalStatus(email: string): Promise<{ status: string, emoji: string, expiry: Date | null, setAt: Date }> {
  const res = await fetch(`https://status.novatea.dev/api/status?email=${email}`);
  const body = await res.json() as { status: string, emoji: string, expiry?: string, setAt: string } | { error: string, message: string };
  if ("error" in body) throw new Error(`${body.message} (${body.error})`);
  return { status: body.status, emoji: body.emoji, expiry: (body.expiry ? new Date(body.expiry) : null), setAt: new Date(body.setAt) };
}