/** @type {import('next').NextConfig} */
export async function rewrites() {
  return [
    {
      source: "/api/:slug*",
      destination: `http://localhost:8885/api/:slug*`,
    },
  ];
}
