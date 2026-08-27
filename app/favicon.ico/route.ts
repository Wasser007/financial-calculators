const WORKING_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0b626b"/>
  <text x="32" y="45" fill="#ffffff" font-family="Georgia,serif" font-size="44" text-anchor="middle">C</text>
</svg>`;

export function GET() {
  return new Response(WORKING_MARK, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
