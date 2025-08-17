import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Linkedin, Github, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      contactMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const contactLinks = [
    {
      icon: Mail,
      title: "Email",
      description: "shashank.karan25@gmail.com",
      href: "mailto:shashank.karan25@gmail.com",
    },
    {
      icon: Linkedin,
      title: "LinkedIn",
      description: "Connect with me",
      href: "https://www.linkedin.com/in/shashank-karan/",
    },
    {
      icon: Github,
      title: "GitHub",
      description: "View my repositories",
      href: "https://github.com/Shashank-Karan",
    },
  ];

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">Let's Work Together</h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            I'm always interested in new opportunities and exciting projects. Let's connect!
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Send me a message</h3>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm sm:text-base">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your name"
                    className="mt-1 sm:mt-2 text-sm sm:text-base h-10 sm:h-11"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1 sm:mt-2 text-sm sm:text-base h-10 sm:h-11"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm sm:text-base">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell me about your project..."
                    rows={4}
                    className="mt-1 sm:mt-2 resize-none text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                  />
                  {errors.message && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{errors.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 transform hover:scale-105"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                  <Send className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Get in touch</h3>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8">
                  I'm currently available for freelance work and full-time opportunities. 
                  If you have a project in mind or just want to chat about technology, feel free to reach out!
                </p>
              </div>
              
              {/* Contact Links */}
              <div className="space-y-3 sm:space-y-4">
                {contactLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.title}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center p-3 sm:p-4 bg-slate-50 rounded-lg hover:bg-blue-50 transition-all duration-300 group transform hover:scale-105 hover:shadow-md"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 group-hover:bg-blue-700 transition-colors shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{link.title}</h4>
                        <p className="text-slate-600 text-xs sm:text-sm md:text-base truncate">{link.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
