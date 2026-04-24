import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useSeo } from "../../context/SeoContext";

/**
 * GlobalSeo — Route-based automatic SEO injection.
 *
 * Must be rendered INSIDE the router (RouterProvider) context.
 * Place it inside AppLayout or AdminLayout so useLocation() works.
 *
 * The component matches the current pathname against page_route values
 * fetched from the API (blogs/seo-settings) and injects the correct
 * <title>, <meta name="description">, <meta name="keywords">, and
 * <link rel="canonical"> tags via react-helmet-async.
 */
const GlobalSeo = () => {
  const location = useLocation();
  const seoData = useSeo();
  const currentPath = location.pathname.replace(/\/$/, "") || "/";
  const canonicalUrl = `${window.location.origin}${currentPath}`;

  const seo = seoData.find((item) => {
    const route = (item.page_route || "").replace(/\/$/, "") || "/";
    return route === currentPath;
  });

  if (!seo) return null;

  return (
    <Helmet>
      {seo.seo_title && <title>{seo.seo_title}</title>}
      {seo.seo_description && (
        <meta name="description" content={seo.seo_description} />
      )}
      {seo.seo_keywords && (
        <meta name="keywords" content={seo.seo_keywords} />
      )}
      {seo.canonical_url && (
        <link rel="canonical" href={canonicalUrl} />
      )}
    </Helmet>
  );
};

export default GlobalSeo;
