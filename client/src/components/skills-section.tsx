import { Code, Layout, Zap, RefreshCw, Server, Database, GitBranch, Cloud } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function SkillsSection() {
  // Get portfolio content
  const { data: portfolioContent } = useQuery({
    queryKey: ["/api/portfolio-content"],
  });

  // Parse skills from database or use defaults
  let skillsFromDB = [];
  try {
    skillsFromDB = (portfolioContent as any)?.skillsList ? JSON.parse((portfolioContent as any).skillsList) : [];
  } catch (e) {
    skillsFromDB = [];
  }

  const defaultSkills = ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "Git", "AWS"];
  const skillNames = skillsFromDB.length > 0 ? skillsFromDB : defaultSkills;

  const skillIcons: { [key: string]: any } = {
    "HTML": { icon: Code, color: "orange" },
    "CSS": { icon: Layout, color: "blue" },
    "JavaScript": { icon: Zap, color: "yellow" },
    "React": { icon: RefreshCw, color: "cyan" },
    "Node.js": { icon: Server, color: "green" },
    "MongoDB": { icon: Database, color: "purple" },
    "Git": { icon: GitBranch, color: "red" },
    "AWS": { icon: Cloud, color: "indigo" },
  };

  const skills = skillNames.map((name: string) => ({
    name,
    icon: skillIcons[name]?.icon || Code,
    color: skillIcons[name]?.color || "blue",
  }));

  return (
    <section id="skills" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">Technical Skills</h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {(portfolioContent as any)?.aboutText || "I work with modern technologies to build robust and scalable applications"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 mb-12 sm:mb-16">
          {skills.map((skill: any) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.name}
                className="skill-badge bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-600 rounded-xl p-3 sm:p-4 text-center cursor-pointer transform hover:scale-105 transition-all duration-300"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${skill.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${skill.color}-600`} />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-800 leading-tight">{skill.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
