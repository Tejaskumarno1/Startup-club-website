
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, BookOpen, Award, Briefcase, Mail, Calendar as CalendarIcon, User, MessageSquare, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

// Simulated mentor data
const mentors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    title: "CEO & Founder, TechInnovate",
    bio: "Dr. Sarah Johnson is a serial entrepreneur with over 15 years of experience in the tech industry. She has founded three successful startups and raised over $50M in venture capital. Her expertise lies in product strategy, go-to-market planning, and scaling startups.",
    profileImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=150&auto=format&fit=crop",
    expertise: ["Product Strategy", "Fundraising", "Tech Startups", "Business Scaling"],
    experience: [
      {
        title: "CEO & Founder",
        company: "TechInnovate",
        duration: "2018 - Present",
        description: "Leading a B2B SaaS platform helping enterprises optimize their cloud infrastructure."
      },
      {
        title: "CTO & Co-Founder",
        company: "DataSense Analytics",
        duration: "2014 - 2018",
        description: "Led the technical team for a data analytics startup (acquired by Microsoft in 2018)."
      },
      {
        title: "Senior Product Manager",
        company: "Google",
        duration: "2010 - 2014",
        description: "Managed Cloud Platform products with a focus on enterprise solutions."
      }
    ],
    education: [
      {
        degree: "Ph.D. in Computer Science",
        institution: "Stanford University",
        year: "2010"
      },
      {
        degree: "M.S. in Technology Management",
        institution: "MIT",
        year: "2006"
      },
      {
        degree: "B.S. in Computer Engineering",
        institution: "UC Berkeley",
        year: "2004"
      }
    ],
    availability: [
      { day: "Monday", slots: ["10:00 AM - 11:00 AM", "3:00 PM - 4:00 PM"] },
      { day: "Wednesday", slots: ["2:00 PM - 3:00 PM"] },
      { day: "Friday", slots: ["11:00 AM - 12:00 PM"] }
    ],
    sessions: 42,
    rating: 4.9,
    reviews: [
      {
        id: "r1",
        name: "Alex Chen",
        date: "2024-05-10",
        rating: 5,
        comment: "Dr. Johnson's advice on our fundraising strategy was invaluable. She helped us refine our pitch and introduced us to several investors. Highly recommend!"
      },
      {
        id: "r2",
        name: "Maria Rodriguez",
        date: "2024-04-22",
        rating: 5,
        comment: "Sarah provided incredibly detailed feedback on our product roadmap. Her insights helped us prioritize features that would drive the most value for customers."
      },
      {
        id: "r3",
        name: "James Wilson",
        date: "2024-03-15",
        rating: 4,
        comment: "Great mentor with practical advice. She helped us navigate our Series A round and provided valuable connections."
      }
    ]
  },
  {
    id: "2",
    name: "Michael Thompson",
    title: "Venture Partner, Elevation Capital",
    bio: "Michael Thompson is a venture capitalist with a focus on early-stage tech startups. With over 10 years in VC and prior experience as an entrepreneur, he brings a unique perspective to startup mentorship, specializing in fundraising, financial modeling, and business development.",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
    expertise: ["Venture Capital", "Financial Modeling", "Business Development", "Pitch Preparation"],
    experience: [
      {
        title: "Venture Partner",
        company: "Elevation Capital",
        duration: "2016 - Present",
        description: "Leading seed and Series A investments in enterprise software and fintech startups."
      },
      {
        title: "Founder",
        company: "MarketPulse",
        duration: "2012 - 2016",
        description: "Built and sold a fintech startup focused on market intelligence for retail investors."
      },
      {
        title: "Investment Banking Associate",
        company: "Morgan Stanley",
        duration: "2008 - 2012",
        description: "Worked on M&A transactions and IPOs for technology companies."
      }
    ],
    education: [
      {
        degree: "MBA",
        institution: "Harvard Business School",
        year: "2008"
      },
      {
        degree: "B.S. in Finance",
        institution: "University of Pennsylvania",
        year: "2004"
      }
    ],
    availability: [
      { day: "Tuesday", slots: ["1:00 PM - 2:00 PM", "4:00 PM - 5:00 PM"] },
      { day: "Thursday", slots: ["11:00 AM - 12:00 PM", "3:00 PM - 4:00 PM"] }
    ],
    sessions: 36,
    rating: 4.7,
    reviews: [
      {
        id: "r4",
        name: "David Park",
        date: "2024-05-05",
        rating: 5,
        comment: "Michael's feedback on our financial model was game-changing. He spotted issues we missed and helped us create a more realistic projection for our investors."
      },
      {
        id: "r5",
        name: "Sophia Nguyen",
        date: "2024-04-12",
        rating: 4,
        comment: "Very knowledgeable about the fundraising landscape. He helped us refine our strategy and introduced us to relevant investors."
      }
    ]
  }
];

const MentorDetail = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingSession, setBookingSession] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch mentor details
    setLoading(true);
    setTimeout(() => {
      const foundMentor = mentors.find(m => m.id === mentorId);
      setMentor(foundMentor || null);
      setLoading(false);
    }, 1000);
  }, [mentorId]);

  // Handle sending a message to the mentor
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive"
      });
      return;
    }

    setSendingMessage(true);
    // Simulate API call
    setTimeout(() => {
      setSendingMessage(false);
      setMessageText("");
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${mentor?.name}.`,
      });
    }, 1500);
  };

  // Handle booking a session
  const handleBookSession = () => {
    if (!selectedSlot) {
      toast({
        title: "Error",
        description: "Please select a time slot.",
        variant: "destructive"
      });
      return;
    }

    setBookingSession(true);
    // Simulate API call
    setTimeout(() => {
      setBookingSession(false);
      setSelectedSlot(null);
      toast({
        title: "Session Booked",
        description: `Your session with ${mentor?.name} has been scheduled.`,
      });
    }, 1500);
  };

  if (loading) {
    return (
      <PageTemplate
        title="Mentor Profile"
        description="Loading mentor details..."
        icon={User}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-12 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="h-64 w-64 rounded-md" />
                <div className="space-y-4 flex-1">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <div className="flex gap-2 flex-wrap mt-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  if (!mentor) {
    return (
      <PageTemplate
        title="Mentor Not Found"
        description="We couldn't find the mentor you're looking for."
        icon={User}
      >
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-lg text-gray-600 mb-6">
              The mentor you're looking for could not be found or may no longer be available.
            </p>
            <Button asChild>
              <Link to="/mentorship/find">
                <ArrowLeft className="mr-2" />
                Back to Mentor List
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Mentor Profile"
      description="View mentor details and book a session."
      icon={User}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/mentorship/find">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Mentors
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4">
                <Avatar className="h-48 w-48 rounded-md">
                  <AvatarImage src={mentor.profileImage} alt={mentor.name} />
                  <AvatarFallback className="text-4xl rounded-md">
                    {mentor.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="text-sm">{mentor.sessions} sessions completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" /><span className="text-sm">{mentor.rating} average rating</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-primary/10">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:w-3/4">
                <h2 className="text-2xl font-bold">{mentor.name}</h2>
                <p className="text-gray-600">{mentor.title}</p>
                
                <div className="mt-4">
                  <p className="text-gray-700">{mentor.bio}</p>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Book a Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book a Session with {mentor.name}</DialogTitle>
                        <DialogDescription>
                          Select an available time slot to schedule your mentorship session.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <h3 className="font-medium">Available Time Slots</h3>
                        <div className="space-y-3">
                          {mentor.availability.map((item: any, dayIndex: number) => (
                            <div key={dayIndex}>
                              <h4 className="text-sm font-medium text-gray-700">{item.day}</h4>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {item.slots.map((slot: string, slotIndex: number) => (
                                  <Button
                                    key={slotIndex}
                                    variant={selectedSlot === `${item.day}-${slot}` ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedSlot(`${item.day}-${slot}`)}
                                    className="justify-start"
                                  >
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    {slot}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={handleBookSession} 
                          isLoading={bookingSession}
                          loadingText="Booking..."
                        >
                          Book Session
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send a Message to {mentor.name}</DialogTitle>
                        <DialogDescription>
                          Introduce yourself and explain what you'd like to discuss in your mentorship session.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder="Type your message here..."
                          className="min-h-[120px]"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          onClick={handleSendMessage} 
                          isLoading={sendingMessage}
                          loadingText="Sending..."
                        >
                          Send Message
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Tabs defaultValue="experience" className="mt-8">
                  <TabsList>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="experience" className="mt-4 space-y-4">
                    {mentor.experience.map((exp: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-medium">{exp.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{exp.company}</span>
                          <span>•</span>
                          <span>{exp.duration}</span>
                        </div>
                        <p className="mt-2 text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="education" className="mt-4 space-y-4">
                    {mentor.education.map((edu: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-medium">{edu.degree}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{edu.institution}</span>
                          <span>•</span>
                          <span>{edu.year}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-4 space-y-4">
                    {mentor.reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{review.name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(review.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

// Star component for ratings
const Star = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

export default MentorDetail;
