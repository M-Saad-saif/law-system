export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/portal", "/api"],
    },
    sitemap: `https://legalportal.site/sitemap.xml`,
  };
}
