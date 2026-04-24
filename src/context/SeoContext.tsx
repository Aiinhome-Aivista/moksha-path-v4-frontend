import { createContext, useContext, useEffect, useState } from "react";
import ApiServices from "../services/ApiServices";

export interface SeoItem {
  id: number;
  page_route: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
}

const SeoContext = createContext<SeoItem[]>([]);

export const SeoProvider = ({ children }: { children: React.ReactNode }) => {
  const [seoData, setSeoData] = useState<SeoItem[]>([]);

  useEffect(() => {
    ApiServices.getBlogSeoSettings()
      .then((res) => {
        if (res?.data?.data) {
          setSeoData(res.data.data);
        }
      })
      .catch(() => {
        // Silently fail — SEO is non-critical
      });
  }, []);

  return <SeoContext.Provider value={seoData}>{children}</SeoContext.Provider>;
};

export const useSeo = () => useContext(SeoContext);
