import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Stars, Sparkles, Moon, Sun, MapPin, Clock, User, Calendar } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const onboardingSchema = z.object({
  username: z.string().optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
});

// Step-specific validation schemas
const getStepSchema = (step: number) => {
  switch (step) {
    case 1: // Personal info
      return z.object({
        username: z.string().min(1, "Username is required"),
      });
    case 2: // Birth date
      return z.object({
        birthDate: z.string().min(1, "Birth date is required"),
      });
    case 3: // Birth time
      return z.object({
        birthTime: z.string().min(1, "Birth time is required for accurate readings"),
      });
    case 4: // Birth location
      return z.object({
        birthLocation: z.string().min(1, "Birth location is required for rising sign calculation"),
      });
    default:
      return z.object({});
  }
};

type OnboardingForm = z.infer<typeof onboardingSchema>;

interface ConstellationOnboardingProps {
  onComplete: () => void;
  user?: any;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to Your Cosmic Journey",
    subtitle: "Let the stars guide your musical destiny",
    icon: Stars,
    constellation: "ursa-major"
  },
  {
    id: "personal",
    title: "Tell Us About Yourself",
    subtitle: "Your cosmic identity begins here",
    icon: User,
    constellation: "orion"
  },
  {
    id: "birth",
    title: "Your Celestial Coordinates",
    subtitle: "When and where did you enter this universe?",
    icon: Calendar,
    constellation: "cassiopeia"
  },
  {
    id: "time",
    title: "The Moment of Your Arrival",
    subtitle: "Precise timing unlocks your rising sign",
    icon: Clock,
    constellation: "leo"
  },
  {
    id: "location",
    title: "Your Earthly Portal",
    subtitle: "Where did your journey begin?",
    icon: MapPin,
    constellation: "lyra"
  },
  {
    id: "complete",
    title: "Your Constellation is Complete",
    subtitle: "Ready to explore your cosmic playlist?",
    icon: Sparkles,
    constellation: "andromeda"
  }
];

const ConstellationBackground = ({ constellation }: { constellation: string }) => {
  const getStarPositions = (constellationName: string) => {
    const constellations: Record<string, Array<{x: number, y: number, size: number}>> = {
      "ursa-major": [
        {x: 20, y: 30, size: 4}, {x: 30, y: 25, size: 3}, {x: 40, y: 28, size: 3},
        {x: 50, y: 32, size: 4}, {x: 60, y: 45, size: 3}, {x: 70, y: 50, size: 4}, {x: 80, y: 48, size: 3}
      ],
      "orion": [
        {x: 30, y: 20, size: 4}, {x: 40, y: 15, size: 3}, {x: 50, y: 25, size: 5},
        {x: 35, y: 40, size: 3}, {x: 45, y: 45, size: 4}, {x: 55, y: 42, size: 3}, {x: 50, y: 60, size: 4}
      ],
      "cassiopeia": [
        {x: 25, y: 35, size: 4}, {x: 40, y: 25, size: 3}, {x: 50, y: 40, size: 4},
        {x: 65, y: 30, size: 3}, {x: 75, y: 45, size: 4}
      ],
      "leo": [
        {x: 20, y: 40, size: 4}, {x: 35, y: 35, size: 5}, {x: 50, y: 30, size: 4},
        {x: 60, y: 45, size: 3}, {x: 70, y: 40, size: 4}, {x: 75, y: 55, size: 3}
      ],
      "lyra": [
        {x: 40, y: 25, size: 5}, {x: 30, y: 40, size: 3}, {x: 45, y: 45, size: 4},
        {x: 55, y: 35, size: 3}, {x: 60, y: 50, size: 4}
      ],
      "andromeda": [
        {x: 15, y: 30, size: 3}, {x: 25, y: 35, size: 4}, {x: 40, y: 25, size: 4},
        {x: 55, y: 30, size: 3}, {x: 65, y: 40, size: 4}, {x: 75, y: 35, size: 3}, {x: 80, y: 50, size: 4}
      ]
    };
    return constellations[constellationName] || constellations["ursa-major"];
  };

  const stars = getStarPositions(constellation);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`bg-star-${i}`}
          className="absolute w-1 h-1 bg-purple-300/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Constellation stars */}
      {stars.map((star, i) => (
        <motion.div
          key={`constellation-star-${i}`}
          className="absolute bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.6, 1, 0.6], 
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.slice(0, -1).map((star, i) => {
          const nextStar = stars[i + 1];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${star.x}%`}
              y1={`${star.y}%`}
              x2={`${nextStar.x}%`}
              y2={`${nextStar.y}%`}
              stroke="url(#gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1, delay: i * 0.3 }}
            />
          );
        })}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default function ConstellationOnboarding({ onComplete, user }: ConstellationOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: user?.username || "",
      birthDate: user?.birthDate || "",
      birthTime: user?.birthTime || "",
      birthLocation: user?.birthLocation || "",
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: OnboardingForm) => {
      return apiRequest("POST", "/api/auth/complete-profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Cosmic Profile Complete!",
        description: "Your stellar journey begins now. Welcome to the universe of personalized music.",
      });
      setTimeout(() => onComplete(), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Profile Update Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSubmit = (data: OnboardingForm) => {
    console.log('Form submitted:', { currentStep, data });
    
    if (currentStep === steps.length - 1) {
      // Final step - complete profile
      completeMutation.mutate(data);
    } else {
      // Validate current step before proceeding
      const stepSchema = getStepSchema(currentStep);
      const result = stepSchema.safeParse(data);
      
      if (result.success || currentStep === 0) {
        nextStep();
      } else {
        console.log('Validation failed for step', currentStep, result.error);
        // Form will show errors automatically
      }
    }
  };

  const handleButtonClick = (e: React.FormEvent) => {
    console.log('Button clicked, currentStep:', currentStep);
    if (currentStep === 0) {
      // Skip validation for welcome step
      e.preventDefault();
      nextStep();
    }
    // For other steps, let the form handle validation
  };

  const current = steps[currentStep];
  const IconComponent = current.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
      <ConstellationBackground constellation={current.constellation} />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          key={currentStep}
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  className="flex justify-center mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm border border-white/20">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                
                <motion.h1
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {current.title}
                </motion.h1>
                
                <motion.p
                  className="text-purple-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {current.subtitle}
                </motion.p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                      <motion.div
                        key="welcome"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-4"
                      >
                        <p className="text-purple-100 leading-relaxed">
                          Welcome to a universe where music meets astrology. We'll create your personalized cosmic profile 
                          to curate playlists that resonate with your celestial energy.
                        </p>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="flex justify-center"
                        >
                          <Stars className="w-12 h-12 text-purple-300" />
                        </motion.div>
                      </motion.div>
                    )}

                    {currentStep === 1 && (
                      <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Choose your cosmic username" 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-sm text-purple-200 mt-2">
                                This is how you'll be addressed in your cosmic journey.
                              </p>
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="birth"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <FormField
                          control={form.control}
                          name="birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Birth Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  className="bg-white/10 border-white/20 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-sm text-purple-200 mt-2">
                                Your birth date determines your sun sign and primary cosmic influences.
                              </p>
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        key="time"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <FormField
                          control={form.control}
                          name="birthTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Birth Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time"
                                  className="bg-white/10 border-white/20 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-sm text-purple-200 mt-2">
                                Precise birth time is crucial for calculating your rising sign and moon phase.
                              </p>
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {currentStep === 4 && (
                      <motion.div
                        key="location"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <FormField
                          control={form.control}
                          name="birthLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Birth Location</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="City, State/Country"
                                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                              <p className="text-sm text-purple-200 mt-2">
                                Your birth location helps us calculate your exact rising sign and chart houses.
                              </p>
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {currentStep === 5 && (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-4"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 180, 360] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                          className="flex justify-center"
                        >
                          <Sparkles className="w-16 h-16 text-yellow-300" />
                        </motion.div>
                        <p className="text-purple-100 leading-relaxed">
                          Your cosmic constellation is now complete! We'll use your celestial coordinates to create 
                          personalized playlists that align with your astrological profile and the current planetary transits.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between pt-6">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        disabled={isTransitioning}
                      >
                        Previous
                      </Button>
                    )}
                    
                    <Button
                      type={currentStep === 0 ? "button" : "submit"}
                      onClick={currentStep === 0 ? handleButtonClick : undefined}
                      className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white ${
                        currentStep === 0 ? 'w-full' : 'ml-auto'
                      }`}
                      disabled={isTransitioning || completeMutation.isPending}
                    >
                      {completeMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Stars className="w-4 h-4" />
                          </motion.div>
                          <span>Creating Your Profile...</span>
                        </div>
                      ) : currentStep === steps.length - 1 ? (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Begin My Cosmic Journey</span>
                        </div>
                      ) : currentStep === 0 ? (
                        "Start Your Journey"
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex justify-center space-x-2 pt-4">
                    {steps.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index <= currentStep ? 'bg-purple-400' : 'bg-white/20'
                        }`}
                        animate={{
                          scale: index === currentStep ? 1.5 : 1,
                          opacity: index <= currentStep ? 1 : 0.5,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}