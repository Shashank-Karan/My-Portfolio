import { Github, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ProjectsSection() {
  // Get portfolio content
  const { data: portfolioContent } = useQuery({
    queryKey: ["/api/portfolio-content"],
  });

  // Parse projects from database or use defaults
  let projectsFromDB = [];
  try {
    if ((portfolioContent as any)?.projectsList) {
      const parsed = JSON.parse((portfolioContent as any).projectsList);
      // Handle both single object and array formats
      if (Array.isArray(parsed)) {
        projectsFromDB = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's a single object, wrap it in an array
        projectsFromDB = [parsed];
      } else {
        projectsFromDB = [];
      }
    }
  } catch (e) {
    console.error('Error parsing projects:', e);
    projectsFromDB = [];
  }

  const defaultProjects = [
    {
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution built with React and Node.js, featuring user authentication, payment integration, and admin dashboard.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      technologies: ["React", "Node.js", "MongoDB"],
      githubUrl: "#",
      demoUrl: "#",
    },
    {
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      technologies: ["React", "Socket.io", "Redis"],
      githubUrl: "#",
      demoUrl: "#",
    },
    {
      title: "Weather Forecast App",
      description: "A responsive weather application with location-based forecasts, interactive maps, and detailed weather analytics using modern APIs.",
      image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      technologies: ["React", "APIs", "Charts.js"],
      githubUrl: "#",
      demoUrl: "#",
    },
    {
      title: "Analytics Dashboard",
      description: "A comprehensive analytics dashboard for social media management with real-time data visualization and reporting features.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      technologies: ["Vue.js", "Express", "PostgreSQL"],
      githubUrl: "#",
      demoUrl: "#",
    },
  ];

  const projects = projectsFromDB.length > 0 ? projectsFromDB : defaultProjects;

  const techColors: { [key: string]: string } = {
    "React": "blue",
    "Node.js": "green",
    "MongoDB": "purple",
    "Socket.io": "yellow",
    "Redis": "red",
    "APIs": "green",
    "Charts.js": "orange",
    "Vue.js": "blue",
    "Express": "green",
    "PostgreSQL": "purple",
  };

  return (
    <section id="projects" className="py-12 sm:py-16 lg:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">Featured Projects</h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Here are some of my recent projects that showcase my skills and experience
          </p>
        </div>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project: any, index: number) => (
            <div
              key={index}
              className={`project-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                index === 3 ? "md:col-span-2 xl:col-span-1" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-40 sm:h-48 md:h-52 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 line-clamp-2">{project.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 leading-relaxed line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                  {project.technologies.map((tech: string) => (
                    <span
                      key={tech}
                      className={`px-2 sm:px-3 py-1 bg-${techColors[tech] || "blue"}-100 text-${techColors[tech] || "blue"}-800 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 hover:bg-${techColors[tech] || "blue"}-200`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <a
                    href={project.githubUrl}
                    className="flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:bg-blue-50 rounded-md px-3 py-2 text-sm sm:text-base"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View Code
                  </a>
                  <a
                    href={project.demoUrl}
                    className="flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:bg-blue-50 rounded-md px-3 py-2 text-sm sm:text-base"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
