import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, ChevronDown, Check, Menu, X } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { submitInquiry } from "@/lib/inquiries-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Images
import heroImg from "@/assets/images/hero.png";
import claddingImg from "@/assets/images/cladding.png";
import boothImg from "@/assets/images/booth.png";
import facadeImg from "@/assets/images/facade.png";
import fitoutImg from "@/assets/images/fitout.png";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company is required"),
  projectType: z.string().min(1, "Please select a project type"),
  description: z.string().min(10, "Please provide more details about your project"),
  email: z.string().email("Invalid email address"),
});

export default function Home() {
  const { toast } = useToast();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      projectType: "",
      description: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const result = await submitInquiry(values);

    setIsSubmitting(false);

    if (!result.ok) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Inquiry Received",
      description: "We'll be in touch to discuss your project shortly.",
    });
    form.reset();
  }

  const scrollToInquiry = () => {
    const element = document.getElementById("inquiry");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-background/90 backdrop-blur-md py-4 border-b border-border" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="text-2xl font-serif font-bold tracking-wide uppercase text-primary">
            ARTGRAPHEGY
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-secondary transition-colors">Philosophy</a>
            <a href="#services" className="hover:text-secondary transition-colors">Expertise</a>
            <a href="#portfolio" className="hover:text-secondary transition-colors">Selected Works</a>
            <Button 
              onClick={scrollToInquiry}
              className="bg-primary hover:bg-secondary text-primary-foreground transition-all duration-300 rounded-none px-6 py-5 uppercase tracking-widest text-xs"
            >
              Start a Project
            </Button>
          </div>

          <button 
            className="md:hidden text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-6 shadow-xl md:hidden">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-serif">Philosophy</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-lg font-serif">Expertise</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="text-lg font-serif">Selected Works</a>
            <Button 
              onClick={scrollToInquiry}
              className="w-full bg-primary text-primary-foreground rounded-none uppercase tracking-widest"
            >
              Start a Project
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Abstract architectural space" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-background/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 flex flex-col items-start mt-20">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.p variants={fadeInUp} className="text-secondary font-medium tracking-widest uppercase mb-4 text-sm md:text-base">
              Architecture & Fabrication
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[1.05] text-primary mb-8">
              Where raw craft meets architectural ambition.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-primary/80 max-w-2xl font-light mb-12">
              We turn material into atmosphere, and drawings into spaces you are proud to own. Bespoke environments delivered at scale.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button 
                onClick={scrollToInquiry}
                size="lg" 
                className="bg-secondary hover:bg-primary text-secondary-foreground rounded-none px-8 py-7 uppercase tracking-widest text-sm transition-colors duration-300"
              >
                Inquire Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="about" className="py-32 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24"
          >
            <div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-serif mb-8 text-primary">
                A relentless pursuit of the perfect finish.
              </motion.h2>
              <motion.div variants={fadeInUp} className="w-24 h-px bg-secondary mb-8" />
            </div>
            <div className="flex flex-col gap-8 text-muted-foreground text-lg font-light leading-relaxed">
              <motion.p variants={fadeInUp}>
                Artgraphegy operates at the intersection of traditional woodworking and modern fabrication. With our state-of-the-art woodwork factory, we oversee every detail from raw material selection to final installation.
              </motion.p>
              <motion.p variants={fadeInUp}>
                This is not standard contracting. It is a meticulous translation of architectural vision into tactile reality. We believe that every surface must be chosen deliberately, and every joint must speak to the quality of the whole.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-20 bg-muted/20 border-y border-border overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground text-center"
          >
            Trusted By
          </motion.p>
        </div>

        {/* Marquee row 1 */}
        <div className="relative w-full overflow-hidden mb-6">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 whitespace-nowrap"
          >
            {[
              "EMAAR PROPERTIES", "ALDAR DEVELOPMENTS", "DAMAC GROUP",
              "ACCOR HOTELS", "HILTON WORLDWIDE", "DUBAI HOLDING",
              "MERAAS", "NAKHEEL", "MAJID AL FUTTAIM",
              "EMAAR PROPERTIES", "ALDAR DEVELOPMENTS", "DAMAC GROUP",
              "ACCOR HOTELS", "HILTON WORLDWIDE", "DUBAI HOLDING",
              "MERAAS", "NAKHEEL", "MAJID AL FUTTAIM",
            ].map((client, i) => (
              <span
                key={i}
                className="text-2xl font-serif font-light text-primary/30 hover:text-secondary transition-colors duration-300 cursor-default tracking-wider select-none"
              >
                {client}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Marquee row 2 — reversed */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 whitespace-nowrap"
          >
            {[
              "FERRARI WORLD", "LOUVRE ABU DHABI", "EXPO CITY DUBAI",
              "ROTANA HOTELS", "JUMEIRAH GROUP", "SOBHA REALTY",
              "SELECT GROUP", "AZIZI DEVELOPMENTS", "BINGHATTI",
              "FERRARI WORLD", "LOUVRE ABU DHABI", "EXPO CITY DUBAI",
              "ROTANA HOTELS", "JUMEIRAH GROUP", "SOBHA REALTY",
              "SELECT GROUP", "AZIZI DEVELOPMENTS", "BINGHATTI",
            ].map((client, i) => (
              <span
                key={i}
                className="text-2xl font-serif font-light text-primary/30 hover:text-secondary transition-colors duration-300 cursor-default tracking-wider select-none"
              >
                {client}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Selected Works Portfolio */}
      <section id="portfolio" className="py-32 bg-[#121212] text-white">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row justify-between items-end mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-serif">Selected Works</h2>
            <p className="text-gray-400 font-light max-w-sm mt-6 md:mt-0 text-right">
              A curation of our recent collaborations with visionary architects and developers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden relative mb-6 bg-black aspect-[3/4]">
                <img 
                  src={claddingImg} 
                  alt="Premium Wooden Wall Cladding" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-serif mb-2 group-hover:text-[#C17F3A] transition-colors">The Grand Atrium</h3>
                  <p className="text-gray-400 font-light text-sm uppercase tracking-widest">Premium Wall Cladding</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group cursor-pointer md:mt-32"
            >
              <div className="overflow-hidden relative mb-6 bg-black aspect-[3/4]">
                <img 
                  src={facadeImg} 
                  alt="Glass Facade on Modern Commercial Building" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-serif mb-2 group-hover:text-[#C17F3A] transition-colors">Nexus Corporate</h3>
                  <p className="text-gray-400 font-light text-sm uppercase tracking-widest">Structural Glass Facade</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="overflow-hidden relative mb-6 bg-black aspect-[3/4]">
                <img 
                  src={fitoutImg} 
                  alt="High-end retail fit-out interiors" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-serif mb-2 group-hover:text-[#C17F3A] transition-colors">Aura Boutique</h3>
                  <p className="text-gray-400 font-light text-sm uppercase tracking-widest">High-End Fit-Out</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group cursor-pointer md:mt-32"
            >
              <div className="overflow-hidden relative mb-6 bg-black aspect-[3/4]">
                <img 
                  src={boothImg} 
                  alt="Custom exhibition booth with intricate joinery" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-serif mb-2 group-hover:text-[#C17F3A] transition-colors">Global Summit Pavilion</h3>
                  <p className="text-gray-400 font-light text-sm uppercase tracking-widest">Custom Exhibition Booth</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expertise / Services Section */}
      <section id="services" className="py-32 bg-muted/30">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-20 text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-serif text-primary mb-6">Our Capabilities</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground font-light max-w-2xl mx-auto">
              Backed by our in-house factory, we deliver uncompromising quality across distinct architectural disciplines.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {[
              {
                title: "Premium Woodwork",
                desc: "From complex wall cladding to bespoke furniture, executed with precision in our state-of-the-art facility."
              },
              {
                title: "Structural Glass",
                desc: "Modern building facades and interior security glass designed for both aesthetic impact and structural integrity."
              },
              {
                title: "Exhibition & Fit-outs",
                desc: "High-end retail environments and custom exhibition booths that command attention and communicate brand prestige."
              }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col"
              >
                <div className="text-secondary font-serif text-5xl mb-6 font-light">0{i + 1}</div>
                <h3 className="text-2xl font-serif text-primary mb-4">{service.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="py-32 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif text-primary mb-8">Let's discuss your next project.</h2>
              <p className="text-muted-foreground text-lg font-light mb-12 max-w-md">
                Whether you are planning a high-end fit-out, a complex facade, or a custom exhibition space, our team is ready to review your requirements.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif text-xl text-primary mb-2">Headquarters</h4>
                  <p className="text-muted-foreground font-light">Dubai Design District<br/>United Arab Emirates</p>
                </div>
                <div>
                  <h4 className="font-serif text-xl text-primary mb-2">Contact</h4>
                  <p className="text-muted-foreground font-light">Artgraphegy3@gmail.com<br/>+20 122 534 1205</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-card border border-border p-8 md:p-12 shadow-sm"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="rounded-none border-b-border bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary px-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Architecture" className="rounded-none border-b-border bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary px-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@acme.com" className="rounded-none border-b-border bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary px-0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Project Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none border-0 border-b border-border bg-transparent shadow-none focus:ring-0 focus:border-primary px-0">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none">
                              <SelectItem value="exhibition">Exhibition Booth</SelectItem>
                              <SelectItem value="cladding">Wall Cladding</SelectItem>
                              <SelectItem value="fitout">Fit-Out</SelectItem>
                              <SelectItem value="facade">Glass Facade</SelectItem>
                              <SelectItem value="printing">Advertising/Printing</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Project Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about the scale, timeline, and requirements..." 
                            className="rounded-none border-border bg-transparent focus-visible:ring-0 focus-visible:border-primary min-h-[120px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-secondary text-primary-foreground rounded-none py-6 uppercase tracking-widest text-sm transition-colors duration-300"
                  >
                    {isSubmitting ? "Sending..." : "Submit Inquiry"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between">
          <div className="text-2xl font-serif font-bold tracking-wide uppercase text-secondary mb-6 md:mb-0">
            ARTGRAPHEGY
          </div>
          <div className="text-primary-foreground/60 text-sm font-light flex gap-6">
            <span>© {new Date().getFullYear()} Artgraphegy. All rights reserved.</span>
            <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
