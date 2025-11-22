import { apiGet } from "@/lib/api/fetch";
import { API_RESEARCH_PUBLIC_PREFIX } from "@/lib/env";
import type { Paginated } from "@/lib/types/department";
import type { Research } from "@/lib/types/research";

const P = API_RESEARCH_PUBLIC_PREFIX;

export function listResearch(params?: {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  department?: string | number;
  researchType?: string;
  status?: string;
  isFeatured?: boolean;
}) {
  return apiGet<Paginated<Research>>(`${P}/research`, params);
}

export function listResearchByDepartment(
  departmentSlug: string,
  params?: { limit?: number; offset?: number; ordering?: string }
) {
  return apiGet<Research[]>(`${P}/research/by_department`, {
    department_slug: departmentSlug,
    ...params,
  });
}

export function listFeaturedResearch(params?: { limit?: number }) {
  return apiGet<Research[]>(`${P}/research/featured`, params);
}
