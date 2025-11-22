import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ExternalLink } from "lucide-react";
import { departmentSlugFromCode } from "@/lib/department";
import { DEPARTMENT_CODE } from "@/lib/env";
import { getDepartment } from "@/lib/data/publicDepartment";
import { listProjectsByDepartment } from "@/lib/data/publicProject";
import type { Project } from "@/lib/types/project";

const titleize = (value?: string | null) =>
  value
    ? value
        .split(/[_\s]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ")
    : "";

export default async function ProjectsPage() {
  const slug = departmentSlugFromCode(DEPARTMENT_CODE);

  let deptName = "Department";
  let deptShortName: string | undefined;
  try {
    const dept = slug ? await getDepartment(slug) : undefined;
    if (dept?.name) deptName = dept.name;
    deptShortName = dept?.shortName;
  } catch (error) {
    console.warn("Failed to load department for projects:", error);
  }

  let projects: Project[] = [];
  let projectsError: string | null = null;

  if (slug) {
    try {
      projects = await listProjectsByDepartment(slug, {
        ordering: "-created_at",
      });
    } catch (error) {
      projectsError =
        error instanceof Error
          ? error.message
          : "Unable to load projects right now.";
    }
  } else {
    projectsError = "Department code is not configured.";
  }

  const ProjectCard = ({ item }: { item: Project }) => (
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
          <Badge variant="secondary">{titleize(item.projectType)}</Badge>
          <Badge variant="outline">{titleize(item.status)}</Badge>
          {item.academicYear && (
            <span className="inline-flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {item.academicYear}
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
          {item.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-1 rounded-full bg-muted"
              style={tag.color ? { border: `1px solid ${tag.color}`, color: tag.color } : {}}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Supervisor: </span>
          {item.supervisorName || "N/A"}
          {item.membersCount ? ` • ${item.membersCount} members` : ""}
        </div>
      </CardHeader>
      {item.demoUrl || item.githubUrl ? (
        <CardContent className="pt-0">
          <div className="flex gap-2 flex-wrap text-sm text-muted-foreground">
            {item.demoUrl && (
              <a
                href={item.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Live demo
              </a>
            )}
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Source
              </a>
            )}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );

  return (
    <div className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold">
            Department Projects
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {deptName} projects & showcases
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore student and faculty-led projects from{" "}
            {deptShortName || deptName}, including capstone work, prototypes,
            and research builds.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Projects</h2>
              <p className="text-sm text-muted-foreground">
                Published projects filtered for this department.
              </p>
            </div>
          </div>

          {projectsError && (
            <p className="text-sm text-red-600">{projectsError}</p>
          )}

          {projects.length === 0 && !projectsError ? (
            <p className="text-sm text-muted-foreground">
              Projects will appear here once they are published for this department.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
