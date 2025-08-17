import { ArrowRight, User, Code } from "lucide-react";
import { useQuery } from "@tanstack/react-query";


export default function HeroSection() {
  // Get portfolio content
  const { data: portfolioContent } = useQuery({
    queryKey: ["/api/portfolio-content"],
  });
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 64;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight">
              Hi, I'm <span className="text-blue-600 block sm:inline">{(portfolioContent as any)?.heroTitle || "Shashank Karan"}</span>
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-600 mt-3 sm:mt-4 font-medium">
              {(portfolioContent as any)?.heroSubtitle || "Full Stack Developer"}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mt-4 sm:mt-6 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {(portfolioContent as any)?.heroDescription || "I create exceptional digital experiences through clean code and thoughtful design. Passionate about building scalable web applications that solve real-world problems."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              <button
                onClick={() => scrollToSection("projects")}
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                View My Work
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Get In Touch
              </button>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
                <img 
                  src={(portfolioContent as any)?.profileImage || ""} 
                  alt={(portfolioContent as any)?.heroTitle || "Profile"}
                  className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-72 lg:h-72 xl:w-88 xl:h-88 object-cover rounded-full"
                />
              </div>
              <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
