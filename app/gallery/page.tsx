import { DEPARTMENT_CODE, getPublicApiUrl } from "@/lib/env";
import { departmentSlugFromCode } from "@/lib/department";
import { getDepartment } from "@/lib/data/publicDepartment";

type GalleryItem = {
  uuid: string;
  image: string;
  caption?: string | null;
  createdAt?: string | null;
};

const formatGalleryDate = (value?: string | null) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return value;
  }
};

export default async function GalleryPage() {
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);
  let department;
  try {
    if (slug) {
      department = await getDepartment(slug);
    }
  } catch (error) {
    console.warn("Unable to load department for gallery:", error);
  }

  let galleryItems: GalleryItem[] = [];
  let galleryError: string | null = null;

  if (department?.uuid) {
    try {
      const params = new URLSearchParams({
        limit: "12",
        source_type: "department_gallery",
        source_identifier: department.uuid,
      });
      const response = await fetch(
        `${getPublicApiUrl("/api/v1/public/website-mod/global-gallery")}?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
          next: { revalidate: 120 },
        }
      );
      if (!response.ok) {
        galleryError = `Gallery service returned ${response.status}`;
      } else {
        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];
        galleryItems = results.map((item: any) => ({
          uuid: item.uuid,
          image: item.image,
          caption: item.caption,
          createdAt: item.createdAt,
        }));
      }
    } catch (error) {
      galleryError = "Failed to load gallery images.";
      console.error("Gallery fetch error:", error);
    }
  }

  return (
    <div className="bg-background py-12">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">
            Department gallery
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {department?.name || "Department gallery"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {department?.shortName
              ? `A curated album of ${department.shortName} labs, events, and research moments.`
              : "Photos and visuals from departments across the campus community."}
          </p>
        </div>

        {galleryError && (
          <p className="text-sm text-red-600 text-center">{galleryError}</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <article key={item.uuid} className="space-y-3">
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img
                  src={item.image}
                  alt={
                    item.caption ||
                    department?.shortName ||
                    "Department gallery image"
                  }
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {item.caption || department?.shortName || "Gallery image"}
                </p>
                {item.createdAt && (
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {formatGalleryDate(item.createdAt)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {galleryItems.length === 0 && !galleryError && (
          <p className="text-center text-sm text-muted-foreground">
            Gallery is being populated. Check back after the next event for fresh pictures.
          </p>
        )}
      </div>
    </div>
  );
}
