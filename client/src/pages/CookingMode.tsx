// import { useState, useEffect } from "react";
// import { useRoute, useLocation } from "wouter";
// import { Recipe } from "@db/schema";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Play,
//   Pause,
//   SkipForward,
//   SkipBack,
//   Mic,
//   MicOff,
//   Timer as TimerIcon,
//   Trash2
// } from "lucide-react";
// import { Loader2 } from "lucide-react";

// interface Timer {
//   id: string;
//   label: string;
//   duration: number;
//   remaining: number;
//   isRunning: boolean;
// }

// export default function CookingMode() {
//   const [, navigate] = useLocation();
//   const [, params] = useRoute("/recipes/:id/cooking");
//   const recipeId = params?.id;
//   const [currentStep, setCurrentStep] = useState(0);
//   const [timers, setTimers] = useState<Timer[]>([]);
//   const [isListening, setIsListening] = useState(false);

//   const { data: recipe, isLoading } = useQuery<Recipe>({
//     queryKey: [`/api/recipes/${recipeId}`],
//     enabled: !!recipeId,
//   });

//   // Process voice commands
//   useEffect(() => {
//     const processCommand = () => {
//       const command = transcript.toLowerCase();

//       if (command.includes("next step")) {
//         handleNextStep();
//       } else if (command.includes("previous step")) {
//         handlePreviousStep();
//       } else if (command.includes("start timer")) {
//         const minutes = command.match(/(\d+)/);
//         if (minutes) {
//           addTimer(parseInt(minutes[1]));
//         }
//       } else if (command.includes("stop timer")) {
//         const timerIndex = timers.findIndex(t => t.isRunning);
//         if (timerIndex !== -1) {
//           toggleTimer(timers[timerIndex].id);
//         }
//       }
//       resetTranscript();
//     };

//     if (transcript) {
//       processCommand();
//     }
//   }, [transcript]);

//   // Timer management
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimers(prevTimers =>
//         prevTimers.map(timer => {
//           if (!timer.isRunning || timer.remaining <= 0) return timer;
//           const remaining = timer.remaining - 1;

//           if (remaining === 0) {
//             // Play notification sound when timer completes
//             new Audio("/timer-complete.mp3").play().catch(console.error);
//           }

//           return { ...timer, remaining };
//         })
//       );
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const addTimer = (minutes: number) => {
//     const newTimer: Timer = {
//       id: Date.now().toString(),
//       label: `Timer ${timers.length + 1}`,
//       duration: minutes * 60,
//       remaining: minutes * 60,
//       isRunning: true,
//     };
//     setTimers(prev => [...prev, newTimer]);
//   };

//   const toggleTimer = (id: string) => {
//     setTimers(prev =>
//       prev.map(timer =>
//         timer.id === id
//           ? { ...timer, isRunning: !timer.isRunning }
//           : timer
//       )
//     );
//   };

//   const resetTimer = (id: string) => {
//     setTimers(prev =>
//       prev.map(timer =>
//         timer.id === id
//           ? { ...timer, remaining: timer.duration, isRunning: false }
//           : timer
//       )
//     );
//   };

//   const deleteTimer = (id: string) => {
//     setTimers(prev => prev.filter(timer => timer.id !== id));
//   };

//   const handleNextStep = () => {
//     if (recipe && currentStep < recipe.instructions.length - 1) {
//       setCurrentStep(prev => prev + 1);
//     }
//   };

//   const handlePreviousStep = () => {
//     if (currentStep > 0) {
//       setCurrentStep(prev => prev - 1);
//     }
//   };

//   const toggleListening = () => {
//     if (listening) {
//       SpeechRecognition.stopListening();
//     } else {
//       SpeechRecognition.startListening({ continuous: true });
//     }
//     setIsListening(!isListening);
//   };

//   if (!browserSupportsSpeechRecognition) {
//     return <div>Browser doesn't support speech recognition.</div>;
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-8">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (!recipe) {
//     return (
//       <div className="text-center py-8">
//         <p>Recipe not found</p>
//         <Button variant="link" onClick={() => navigate("/")}>
//           Go back home
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="flex items-center justify-between mb-6">
//         <Button variant="ghost" onClick={() => navigate(`/recipes/${recipeId}`)}>
//           Exit Cooking Mode
//         </Button>
//         <Button
//           variant={isListening ? "destructive" : "default"}
//           onClick={toggleListening}
//           className="flex items-center gap-2"
//         >
//           {isListening ? (
//             <>
//               <MicOff className="h-4 w-4" />
//               Stop Listening
//             </>
//           ) : (
//             <>
//               <Mic className="h-4 w-4" />
//               Start Listening
//             </>
//           )}
//         </Button>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6">
//         <div className="space-y-6">
//           <Card>
//             <CardContent className="pt-6">
//               <h2 className="text-xl font-semibold mb-4">Current Step</h2>
//               <div className="space-y-4">
//                 <p className="text-lg">{recipe.instructions[currentStep]}</p>
//                 <div className="flex items-center justify-center gap-4">
//                   <Button
//                     variant="outline"
//                     onClick={handlePreviousStep}
//                     disabled={currentStep === 0}
//                   >
//                     <SkipBack className="h-4 w-4" />
//                   </Button>
//                   <span className="text-sm text-muted-foreground">
//                     Step {currentStep + 1} of {recipe.instructions.length}
//                   </span>
//                   <Button
//                     variant="outline"
//                     onClick={handleNextStep}
//                     disabled={currentStep === recipe.instructions.length - 1}
//                   >
//                     <SkipForward className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="pt-6">
//               <h2 className="text-xl font-semibold mb-4">Ingredients Needed</h2>
//               <ul className="space-y-2">
//                 {recipe.ingredients.map((ingredient, index) => (
//                   <li key={index} className="flex items-center gap-2">
//                     <span className="w-2 h-2 rounded-full bg-primary" />
//                     {ingredient}
//                   </li>
//                 ))}
//               </ul>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="space-y-6">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold">Timers</h2>
//                 <Button
//                   variant="outline"
//                   onClick={() => addTimer(5)}
//                   className="flex items-center gap-2"
//                 >
//                   <TimerIcon className="h-4 w-4" />
//                   Add Timer
//                 </Button>
//               </div>
//               <div className="space-y-4">
//                 {timers.map(timer => (
//                   <div
//                     key={timer.id}
//                     className="flex items-center justify-between p-4 rounded-lg border"
//                   >
//                     <div className="space-y-1">
//                       <p className="font-medium">{timer.label}</p>
//                       <p className="text-2xl font-bold">
//                         {Math.floor(timer.remaining / 60)}:
//                         {(timer.remaining % 60).toString().padStart(2, "0")}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => toggleTimer(timer.id)}
//                       >
//                         {timer.isRunning ? (
//                           <Pause className="h-4 w-4" />
//                         ) : (
//                           <Play className="h-4 w-4" />
//                         )}
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => resetTimer(timer.id)}
//                       >
//                         <SkipBack className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="icon"
//                         onClick={() => deleteTimer(timer.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//                 {timers.length === 0 && (
//                   <p className="text-center text-muted-foreground">
//                     No active timers
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="pt-6">
//               <h2 className="text-xl font-semibold mb-4">Voice Commands</h2>
//               <ul className="space-y-2">
//                 <li>"Next step" - Move to next instruction</li>
//                 <li>"Previous step" - Go back to previous instruction</li>
//                 <li>"Start timer [minutes]" - Start a new timer</li>
//                 <li>"Stop timer" - Pause the most recent timer</li>
//               </ul>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }
