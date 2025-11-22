import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen } from "lucide-react";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE } from "@/lib/env";
import { getDepartment } from "@/lib/data/publicDepartment";
import { listResearchByDepartment } from "@/lib/data/publicResearch";
import type { Research } from "@/lib/types/research";

const formatDate = (value?: string | null) => {
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

const titleize = (value?: string | null) =>
  value
    ? value
        .split(/[_\s]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    : "";

const formatCurrency = (value?: number | null) => {
  if (!value) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}`;
  }
};

function ResearchCard({ item }: { item: Research }) {
  return (
    <Card className="h-full shadow-sm border-border/70">
      <div className="aspect-video w-full bg-muted overflow-hidden">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{titleize(item.researchType)}</Badge>
          <Badge variant="outline">{titleize(item.status)}</Badge>
          {item.startDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(item.startDate)}
              {item.endDate ? ` – ${formatDate(item.endDate)}` : ""}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {item.abstract}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.categories.map((cat) => (
            <span
              key={cat.id}
              className="text-xs px-2 py-1 rounded-full bg-muted"
              style={
                cat.color ? { border: `1px solid ${cat.color}`, color: cat.color } : {}
              }
            >
              {cat.name}
            </span>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">PI: </span>
          {item.principalInvestigatorShort || "TBD"}
          {item.fundingAgency && (
            <>
              {" • "}
              <span className="text-foreground">Funding:</span> {item.fundingAgency}
            </>
          )}
          {item.fundingAmount && <> ({formatCurrency(item.fundingAmount)})</>}
        </div>
      </CardHeader>
    </Card>
  );
}

export default async function ResearchPage() {
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  let deptShortName: string | undefined;
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
    deptShortName = dept?.shortName;
  } catch (error) {
    console.warn("Failed to load department for research/projects:", error);
  }

  let research: Research[] = [];
  let researchError: string | null = null;

  if (slug) {
    try {
      research = await listResearchByDepartment(slug, {
        ordering: "-start_date",
      });
    } catch (error) {
      researchError =
        error instanceof Error
          ? error.message
          : "Unable to load research items right now.";
    }

  } else {
    researchError = "Department code is not configured.";
  }

  return (
    <div className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            Research & Projects
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {deptName} scholarly work
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore published research, funded initiatives, and student-led projects
            emerging from {deptShortName || deptName}.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Research initiatives</h2>
              <p className="text-sm text-muted-foreground">
                Active and recent research tied to the department.
              </p>
            </div>
          </div>

          {researchError && (
            <p className="text-sm text-red-600">{researchError}</p>
          )}

          {research.length === 0 && !researchError ? (
            <p className="text-sm text-muted-foreground">
              Research portfolio is being curated. Check back soon for published items.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {research.map((item) => (
                <ResearchCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
