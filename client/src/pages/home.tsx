import Navigation from "../components/navigation";
import HeroSection from "../components/hero-section";
import SkillsSection from "../components/skills-section";
import ProjectsSection from "../components/projects-section";
import ContactSection from "../components/contact-section";

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-800">
      <Navigation />
      <HeroSection />
      <SkillsSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
