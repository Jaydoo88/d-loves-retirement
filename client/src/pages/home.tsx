import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";

// Images
import heroCurrent from "@/assets/images/dloveK9_1773199988602.jpg";
import heroPast from "@/assets/images/dlovek9beginning_1773200003177.jpg";
import officerImg from "@/assets/images/officer.jpg";
import heroImage1 from "@/assets/images/hero-event.jpg";
import heroImage2 from "@/assets/images/hero-2.jpg";
import heroImage3 from "@/assets/images/hero-3.jpg";
import gallery1 from "@/assets/images/gallery-1.jpg";
import venueImg from "@/assets/images/venuebanner.png";
import golfPromoImg from "@/assets/images/golfoutingad.png";

import badgeUsaf from "@/assets/images/airforce_1773199470423.png";
import badgeUss from "@/assets/images/secret-servicelogo_1773199476618.png";
import badgeUscs from "@/assets/images/us-customs-service_1773199480633.png";
import badgeCbp from "@/assets/images/cbplogo_1773199483919.png";

import badgeUsafSecurity from "@/assets/images/security-police_1773199592450.png";
import badgeUssOfficer from "@/assets/images/secret-service_1773199595926.jpg";
import badgeUscsOfficer from "@/assets/images/us-customs-badge_1773199599868.png";
import badgeCbpOfficer from "@/assets/images/cbp_1773199589645.png";
import familyImg from "@/assets/images/family_1773246071709.png";
import k9PartnerImg from "@/assets/images/k9partner_1773246579750.png";
import badgePawImg from "@/assets/images/badge_paw_1773246774167.png";
import lifetimeK9Img from "@/assets/images/lifetime_k9_1773246841147.png";
import inSyncImg from "@/assets/images/in_sync_1773246954284.png";
import reasons113kImg from "@/assets/images/113k_reasons_1773247067598.png";
import twoSoldiersImg from "@/assets/images/two_soldiers_1773247102893.png";
import protectingPowerImg from "@/assets/images/protecting_power_1773247151280.png";
import proudToServeImg from "@/assets/images/proud_to_serve_1773247229051.png";
import washRinseServeImg from "@/assets/images/wash_rinse_serve_1773247290439.png";
import calmBeforeCallImg from "@/assets/images/calm_before_the_call_1773247316901.png";
import rootsOfServiceImg from "@/assets/images/roots_of_service_1773247374331.png";
import packageSecuredImg from "@/assets/images/package_secured_1773247458096.png";
import noseNeverLiesImg from "@/assets/images/nose_never_lies_1773247519588.png";
import trainingRealThingImg from "@/assets/images/training_for_the_real_thing_1773247588570.png";
import waitingForSignalImg from "@/assets/images/waiting_for_signal_1773247633615.png";
import noHidingFromNoseImg from "@/assets/images/no_hiding_from_nose_1773247665979.png";
import wherePartnersAreMadeImg from "@/assets/images/where_partners_are_made_1773247705463.png";

const galleryImages = [
  { img: familyImg, title: "Loyalty, Service, Family, Forever." },
  { img: k9PartnerImg, title: "K9 Partners Through the Years." },
  { img: badgePawImg, title: "The Badge & The Paw." },
  { img: lifetimeK9Img, title: "A Lifetime of K9 Service." },
  { img: inSyncImg, title: "In Sync, on duty, in trust." },
  { img: reasons113kImg, title: "113K reasons to trust K9." },
  { img: twoSoldiersImg, title: "Two soldiers. One mission." },
  { img: protectingPowerImg, title: "Protecting power on the lawn." },
  { img: proudToServeImg, title: "Proud to serve, side by side." },
  { img: washRinseServeImg, title: "Wash, rinse, serve." },
  { img: calmBeforeCallImg, title: "Calm before the call." },
  { img: rootsOfServiceImg, title: "Roots of service run deep." },
  { img: packageSecuredImg, title: "Package secured - K9 approved." },
  { img: noseNeverLiesImg, title: "The nose never lies." },
  { img: trainingRealThingImg, title: "Training for the real thing." },
  { img: waitingForSignalImg, title: "Waiting for the signal." },
  { img: noHidingFromNoseImg, title: "No hiding from this nose." },
  { img: wherePartnersAreMadeImg, title: "Where partners are made." }
];

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  const heroImages = [heroCurrent, heroPast];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImageIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    }, 5000); // Switch every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const scrollGallery = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleRSVP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get('_honeypot');
    
    if (honeypot) {
      setIsSubmitting(false);
      return; // Basic bot protection
    }

    const email = formData.get('email') as string;

    const rsvpData = {
      full_name: formData.get('fullName') as string,
      email: email,
      organization: formData.get('organization') as string,
      status: formData.get('attending') as string,
      guest_count: parseInt(formData.get('guests') as string, 10),
      message: formData.get('message') as string,
      source: 'site_form',
      submitted_at: new Date().toISOString()
    };

    try {
      // Check if email already exists
      const { data: existingData, error: searchError } = await supabase
        .from('rsvps')
        .select('id')
        .eq('email', email)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        throw searchError;
      }

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('rsvps')
          .update(rsvpData)
          .eq('id', existingData.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('rsvps')
          .insert([rsvpData]);

        if (insertError) throw insertError;
      }

      toast({
        title: "RSVP Confirmed",
        description: "Thank you for submitting your response.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error("Error submitting RSVP:", err);
      toast({
        title: "Submission Failed",
        description: err.message || "There was a problem submitting your RSVP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* 1. Ultra-Refined Hero Section */}
      <section className="relative pt-8 pb-6 lg:pt-10 lg:pb-8 bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-white pointer-events-none" />
        
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl mx-auto mt-2 px-2">
          <p className="text-secondary font-medium tracking-[0.25em] uppercase text-xs md:text-sm mb-2 opacity-90">
            Celebrating the Retirement of Officer
          </p>
          
          <h1 className="font-serif text-[7vw] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-primary font-bold mb-3 tracking-tight leading-[1.05] whitespace-nowrap">
            Darren "D-Love" Johnson
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-6">
            <div className="hidden sm:block h-[1px] w-12 bg-primary/20" />
            <h3 className="font-sans text-xs sm:text-sm md:text-base text-primary/70 tracking-[0.1em] sm:tracking-[0.2em] uppercase text-center">
              K9 Extraordinaire – A Legacy of Service
            </h3>
            <div className="hidden sm:block h-[1px] w-12 bg-primary/20" />
          </div>
          
          <div className="relative mb-6 inline-block group max-w-[90vw]">
            <div className="absolute inset-0 rounded-full border border-primary/5 scale-[1.15] transition-transform duration-1000 group-hover:scale-[1.2]" />
            <div className="absolute inset-0 rounded-full border border-secondary/10 scale-[1.08] transition-transform duration-700 group-hover:scale-[1.12]" />
            <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl mx-auto relative z-10 ring-4 sm:ring-8 ring-white">
              <img 
                src={heroImages[currentHeroImageIndex]} 
                alt="Officer Darren Johnson" 
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>

          <p className="text-lg md:text-xl text-primary/80 max-w-3xl mx-auto font-light leading-relaxed">
            Join us as we honor an exceptional career protecting our nation and serving our communities.
          </p>
        </div>
      </section>

      {/* 2. Honoring 37 Years of Service + Main Event card */}
      <section className="py-8 lg:py-10 bg-white relative border-t border-border/40">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            
            {/* Legacy Text - Left Side */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center pr-0 lg:pr-6">
              <span className="text-secondary tracking-[0.2em] uppercase text-xs font-bold mb-2 block">Honoring a Life of Service</span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-[2.75rem] text-primary font-bold leading-tight mb-4">
                37 Years of Unwavering Dedication
              </h2>
              <div className="space-y-4 text-base md:text-lg text-primary/70 font-light leading-[1.7] max-w-4xl">
                <p>
                  With over three decades of dedicated government service — including a distinguished tenure with U.S. Customs and Border Protection under the Department of Homeland Security — Darren Johnson has shown an unparalleled commitment to protecting our nation.
                </p>
                <p>
                  His leadership, expertise, and dedication have left a lasting impact on his colleagues, the communities he served, and the critical mission of securing America's borders. It is a legacy defined not by years, but by the countless lives touched and protected.
                </p>
                <p>
                  As he steps into this next chapter, we gather to celebrate a career characterized by honor, resilience, and an unyielding commitment to duty.
                </p>
              </div>
            </div>

            {/* Event Details Card - Right Side */}
            <div className="lg:col-span-5 xl:col-span-4 mt-6 lg:mt-0">
              <div className="bg-[#FAF9F6] border border-border/60 rounded-2xl p-6 relative shadow-lg shadow-primary/5 max-w-md mx-auto w-full">
                <h3 className="font-serif text-xl font-bold mb-5 text-primary border-b border-primary/10 pb-3 text-center">
                  The Main Event
                </h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="w-5 h-5 text-secondary mb-1.5" strokeWidth={1.5} />
                    <p className="text-[10px] text-primary/50 uppercase tracking-[0.2em] mb-0.5 font-medium">Date</p>
                    <p className="text-sm md:text-base font-medium text-primary tracking-wide">Saturday, May 23, 2026</p>
                  </div>
                  
                  <div className="w-12 h-px bg-border/60 mx-auto" />

                  <div className="flex flex-col items-center text-center">
                    <Clock className="w-5 h-5 text-secondary mb-1.5" strokeWidth={1.5} />
                    <p className="text-[10px] text-primary/50 uppercase tracking-[0.2em] mb-0.5 font-medium">Time</p>
                    <p className="text-sm md:text-base font-medium text-primary tracking-wide">1700 (5:00 PM)</p>
                  </div>
                  
                  <div className="w-12 h-px bg-border/60 mx-auto" />

                  <div className="flex flex-col items-center text-center">
                    <MapPin className="w-5 h-5 text-secondary mb-1.5" strokeWidth={1.5} />
                    <p className="text-[10px] text-primary/50 uppercase tracking-[0.2em] mb-0.5 font-medium">Location</p>
                    <p className="text-sm md:text-base font-medium text-primary tracking-wide">German American Club</p>
                    <p className="text-xs md:text-sm text-primary/60 mt-0.5 font-light">Louisville, Kentucky</p>
                  </div>

                  <div className="w-12 h-px bg-border/60 mx-auto" />

                  <div className="flex flex-col items-center text-center">
                    <p className="text-[10px] text-primary/50 uppercase tracking-[0.2em] mb-0.5 font-medium">Attire</p>
                    <p className="text-sm md:text-base font-medium text-primary tracking-wide">Casual <span className="text-xs md:text-sm text-primary/50 font-light italic ml-1">(Ceremony is formal)</span></p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Celebration Weekend */}
      <section className="py-8 lg:py-10 bg-[#FAFAFA] border-t border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Pre-Event & Location</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-4xl text-primary font-bold">Celebration Weekend</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto">
            
            {/* Golf Promo */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border/50 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500">
              <div className="h-[240px] md:h-[280px] relative overflow-hidden bg-[#e0d6c8] shrink-0 border-b border-border/40">
                <img src={golfPromoImg} alt="Golf Promo" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="px-6 py-6 md:px-8 md:py-8 flex flex-col flex-grow items-center text-center">
                <div className="mb-6 flex-grow flex flex-col justify-center w-full">
                  <h3 className="font-serif text-2xl md:text-[28px] text-primary font-bold mb-2 tracking-wide whitespace-nowrap">Golf Outing Scramble</h3>
                  <p className="text-primary/70 font-light text-[13px] md:text-sm w-full mx-auto whitespace-nowrap">
                    Join us for a round before the main event.
                  </p>
                </div>
                <Link href="/golf" className="w-full mt-auto" onClick={() => window.scrollTo(0, 0)}>
                  <Button variant="outline" className="w-full rounded-full h-11 md:h-12 border-primary/20 hover:bg-primary hover:text-white group-hover:border-primary transition-all duration-300 text-xs font-bold tracking-[0.15em] uppercase">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            {/* Venue Promo */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border/50 flex flex-col group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500">
              <div className="h-[240px] md:h-[280px] relative overflow-hidden bg-primary shrink-0 border-b border-border/40">
                <img src={venueImg} alt="Venue Promo" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="px-6 py-6 md:px-8 md:py-8 flex flex-col flex-grow items-center text-center">
                <div className="mb-6 flex-grow flex flex-col justify-center w-full">
                  <h3 className="font-serif text-2xl md:text-[28px] text-primary font-bold mb-2 tracking-wide whitespace-nowrap">The Venue</h3>
                  <p className="text-primary/70 font-light text-[13px] md:text-sm w-full mx-auto whitespace-nowrap">
                    Explore the German American Club.
                  </p>
                </div>
                <Link href="/venue" className="w-full mt-auto" onClick={() => window.scrollTo(0, 0)}>
                  <Button variant="outline" className="w-full rounded-full h-11 md:h-12 border-primary/20 hover:bg-primary hover:text-white group-hover:border-primary transition-all duration-300 text-xs font-bold tracking-[0.15em] uppercase">
                    Explore Location
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Lodging Spotlight */}
      <section className="py-12 lg:py-16 bg-white border-t border-border/40">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Accommodation</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary font-bold mb-6">Lodging Spotlight</h2>
          
          <p className="text-base md:text-lg text-primary/70 leading-relaxed mb-8 font-light max-w-3xl mx-auto">
            We recommend the <strong className="text-primary font-medium">Derby City Gaming Hotel</strong> as the primary place to stay during the celebration weekend. Connected directly to the casino and open 24 hours, it offers dining, entertainment, and a lively atmosphere that makes it the perfect gathering spot for guests throughout the weekend.
          </p>
          
          <div className="bg-[#FAF9F6] p-8 rounded-2xl border border-border/80 shadow-sm relative overflow-hidden mb-10 max-w-3xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary" />
            <h4 className="text-lg md:text-xl font-serif text-primary mb-4 font-bold flex items-center justify-center gap-2">
              <span className="text-secondary text-sm">⭐</span> Important Booking Information
            </h4>
            <p className="text-primary/80 text-base md:text-lg leading-relaxed mb-4">
              Call <a href="tel:502-961-7636" className="text-secondary font-bold hover:underline">502-961-7636</a> and use <strong className="font-medium">"Johnson Retirement Party"</strong> when speaking with a reservation agent to receive a <strong className="text-secondary font-bold">$25 casino play credit</strong>.
            </p>
            <p className="text-xs md:text-sm text-primary/60 tracking-wider uppercase font-medium">Reservations made online will NOT include the credit.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full px-8 py-6 text-sm md:text-base font-medium tracking-wide shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
                  Read Full Hotel & Casino Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <div className="p-2">
                  <h3 className="font-serif text-2xl md:text-3xl text-primary font-bold mb-4">Derby City Gaming Hotel Details</h3>
                  
                  <div className="space-y-6 text-primary/80 font-light leading-relaxed">
                    <p>
                      The Derby City Gaming Hotel is the recommended place to stay, and many guests attending the retirement celebration are expected to book here.
                    </p>

                    <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                      <p className="mb-3 font-medium text-primary">To receive the $25 casino play credit, guests must call the hotel directly at:</p>
                      <a href="tel:502-961-7636" className="text-2xl font-bold text-secondary block mb-3 hover:underline">502-961-7636</a>
                      <p className="mb-2">When speaking with a reservation agent, mention:</p>
                      <p className="font-serif text-xl font-bold text-primary mb-3">"Johnson Retirement Party"</p>
                      <p className="text-sm">This credit is only available for reservations made by phone. Reservations made online will not include the casino credit.</p>
                    </div>

                    <div>
                      <h4 className="font-serif text-xl text-primary font-bold mb-3">Why This Hotel Is Recommended</h4>
                      <p className="mb-4">The Derby City Gaming Hotel is directly connected to the casino and offers a much more social and entertaining environment than a traditional hotel stay.</p>
                      <p className="mb-2 font-medium">Guests will have access to:</p>
                      <ul className="list-disc pl-5 space-y-1 mb-4 text-sm md:text-base">
                        <li>Over 1,300 historical horse racing gaming machines</li>
                        <li>A full sportsbook lounge</li>
                        <li>Multiple dining options</li>
                        <li>Full bar and lounge areas</li>
                        <li>Live music performances on Friday and Saturday nights</li>
                      </ul>
                      <p className="mb-3">This makes it an ideal place for guests to relax, reconnect, and continue the celebration outside of the main event.</p>
                      <p>Rather than everyone gathering in a quiet hotel lobby, the casino and entertainment venue provide a fun and comfortable space for everyone to socialize throughout the weekend.</p>
                    </div>

                    <div>
                      <h4 className="font-serif text-xl text-primary font-bold mb-3">Room Block Information</h4>
                      <p className="mb-2">Rooms have been blocked for guests attending the retirement celebration. We recommend booking your room as early as possible to ensure availability.</p>
                      <p>If the reserved room block fills up, additional rooms may be added based on availability.</p>
                    </div>

                    <div>
                      <h4 className="font-serif text-xl text-primary font-bold mb-3">Who This Hotel Is For</h4>
                      <p className="mb-2 font-medium">This hotel is ideal for:</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                        <li>Ramstein alumni attending the celebration</li>
                        <li>Guests traveling from out of town or out of state</li>
                        <li>Anyone planning to stay overnight after the event</li>
                        <li>Guests who want entertainment, dining, and nightlife nearby</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-serif text-xl text-primary font-bold mb-3">Location Details</h4>
                      <p className="mb-2">Derby City Gaming Hotel is conveniently located:</p>
                      <ul className="list-none space-y-2 mb-4 font-medium text-primary">
                        <li className="flex items-center gap-2"><MapPin size={16} className="text-secondary" /> 1.6 miles from the event venue</li>
                        <li className="flex items-center gap-2"><MapPin size={16} className="text-secondary" /> 3.6 miles from Louisville International Airport</li>
                      </ul>
                      <p>This makes it an easy and convenient stay for both local and traveling guests.</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Link href="/hotels" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="outline" className="rounded-full px-8 py-6 text-sm md:text-base font-medium tracking-wide border-primary/20 hover:bg-primary hover:text-white transition-all w-full sm:w-auto">
                View All Lodging Options <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. A Life of Service */}
      <section className="py-8 lg:py-10 bg-[#FAFAFA] border-t border-border/40">
        <div className="container mx-auto px-4 max-w-[1400px]">
          
          <div className="text-center mb-8">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-2 block">History</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-4xl text-primary font-bold mb-3">A Life of Service</h2>
            <p className="text-base md:text-lg text-primary/70 font-light max-w-3xl mx-auto">
              A comprehensive timeline of duty, leadership, and unwavering commitment.
            </p>
          </div>

          <div className="flex flex-col gap-12 lg:gap-16">
            
            {/* Career Journey */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl md:text-2xl text-primary font-bold mb-4 tracking-wide uppercase border-b border-border/60 pb-2">Career Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { agency: "United States Air Force (USAF)", years: "1988 – 1994", desc: "Built the foundation of service, discipline, and mission focus.", logos: [badgeUsaf, badgeUsafSecurity] },
                  { agency: "U.S. Secret Service", years: "1995 – 1997", desc: "Protection & investigations in support of national leadership.", logos: [badgeUss, badgeUssOfficer] },
                  { agency: "U.S. Customs Service", years: "1997 – 2003", desc: "Trade enforcement and border security—the legacy agency that later integrated into DHS.", logos: [badgeUscs, badgeUscsOfficer] },
                  { agency: "U.S. Customs and Border Protection (CBP)", years: "2003 – 2026", desc: "Frontline homeland security—K9 operations, leadership, and mentorship.", logos: [badgeCbp, badgeCbpOfficer] }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 group items-center bg-white p-4 rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-all">
                    <div className="relative shrink-0 w-[80px] h-[56px] flex items-center justify-center">
                      {step.logos.map((logo, logoIdx) => (
                        <div 
                          key={logoIdx} 
                          className={`absolute w-[56px] h-[56px] rounded-full border border-border/60 bg-[#FAF9F6] flex items-center justify-center p-1.5 shadow-sm transition-all duration-500
                            ${logoIdx === 0 ? 'left-0 z-20 group-hover:-translate-x-2 group-hover:shadow-md' : 'left-6 z-10 group-hover:translate-x-2 group-hover:shadow-md'}
                          `}
                        >
                          <img src={logo} alt={`${step.agency} badge`} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 pl-3 border-l border-border/40">
                      <div className="text-secondary font-bold tracking-[0.2em] text-[10px] uppercase mb-1">{step.years}</div>
                      <h4 className="font-serif font-bold text-primary text-lg mb-0.5">{step.agency}</h4>
                      <p className="text-primary/70 text-xs md:text-sm leading-relaxed font-light">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Highlights */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-serif text-xl md:text-2xl text-primary font-bold mb-4 tracking-wide uppercase border-b border-border/60 pb-2">Career Highlights</h3>
              
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-border/60 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <div>
                    <h4 className="font-serif text-lg md:text-xl text-primary font-bold mb-4">Accomplishments & Awards</h4>
                    <ul className="space-y-3 text-primary/70 font-light text-sm md:text-base">
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Distinguished/Expert firearms qualifications (1988–2026)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">USAF Top Dog competitions: 1st (Base-wide, 1989); 2nd (USAFE, 1990)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">USAF Performance & Achievement/Commendation medals (1992–1994)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Knights of Columbus “Blue Coat” Award (1994)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Good Conduct, Longevity & Outstanding Unit Awards (1988–1994)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">U.S. Customs Millennium Tour of Duty (1999–2000)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Founding Member/Employee of DHS (2003)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">CBP Blue Eagle Award (2014)</span></li>
                      <li className="flex items-start"><span className="text-secondary mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Unit Citation Awards ×5 (2008–2026)</span></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-serif text-lg md:text-xl text-primary font-bold mb-4">Memberships</h4>
                    <ul className="space-y-3 text-primary/70 font-light text-sm md:text-base">
                      <li className="flex items-start"><span className="text-primary/30 mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Dogs Against Drugs & Crime; National L.E. K-9 Assoc. (2001)</span></li>
                      <li className="flex items-start"><span className="text-primary/30 mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">American Legion (2008)</span></li>
                      <li className="flex items-start"><span className="text-primary/30 mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Veterans of Foreign Wars — Lifetime (since 2010)</span></li>
                      <li className="flex items-start"><span className="text-primary/30 mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">Guns of Justice L.E. Motorcycle Club (2009)</span></li>
                      <li className="flex items-start"><span className="text-primary/30 mr-3 mt-1.5 text-[10px]">■</span> <span className="leading-relaxed">German American Club (2025)</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Memories on the Job */}
      <section className="py-8 lg:py-10 bg-primary overflow-hidden border-t border-border/40">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-white/10 pb-4">
            <div className="max-w-3xl">
              <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Gallery</span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-4xl text-white font-bold mb-2">Memories on the Job</h2>
              <p className="text-white/70 font-light text-base md:text-lg leading-relaxed">
                A snapshot of the moments that shaped an extraordinary career.
              </p>
            </div>
            <div className="flex gap-3 pb-1">
              <button 
                onClick={() => scrollGallery('left')}
                className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all focus:outline-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollGallery('right')}
                className="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all focus:outline-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar pt-2"
          >
            {galleryImages.map((item, i) => (
              <Dialog key={i}>
                <DialogTrigger asChild>
                  <div className="flex-none w-[280px] md:w-[360px] snap-center cursor-pointer group flex flex-col">
                    <div className="relative bg-white rounded-xl p-3 md:p-4 border border-black/5 hover:border-black/10 transition-all duration-500 hover:-translate-y-2 flex-1 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                      <div className="w-full h-[200px] md:h-[260px] overflow-hidden rounded-md bg-[#f4f4f5] flex items-center justify-center border border-black/[0.03]">
                        <img 
                          src={item.img} 
                          alt={item.title} 
                          className="w-full h-full object-contain p-2 md:p-3 transition-transform duration-1000 group-hover:scale-105 filter grayscale-[15%] group-hover:grayscale-0"
                        />
                      </div>
                      <div className="mt-4 flex items-start gap-3 px-1">
                        <div className="w-1 h-4 md:h-5 bg-secondary rounded-full shrink-0 mt-0.5" />
                        <p className="font-serif text-primary text-sm md:text-base tracking-wide font-medium leading-tight">{item.title}</p>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] lg:max-w-5xl bg-transparent border-0 shadow-none p-0">
                  <img src={item.img} alt={item.title} className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Join Us in Celebration (RSVP) */}
      <section id="rsvp-section" className="py-8 lg:py-12 bg-white relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-2 block">RSVP</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-4xl text-primary font-bold mb-3">Join Us in Celebration</h2>
            <p className="text-base md:text-lg text-primary/60 font-light max-w-2xl mx-auto">Please confirm your attendance by May 1st, 2026.</p>
          </div>

          <div className="bg-[#FAF9F6] rounded-3xl p-6 md:p-10 border border-border/80 shadow-md shadow-primary/5">
            <form onSubmit={handleRSVP} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-primary/70 font-medium tracking-widest uppercase text-[10px]">Full Name <span className="text-secondary">*</span></Label>
                  <Input id="fullName" name="fullName" required placeholder="John Doe" className="border-0 border-b-2 border-border/80 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-base md:text-lg h-auto shadow-none placeholder:text-primary/30 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-primary/70 font-medium tracking-widest uppercase text-[10px]">Email Address <span className="text-secondary">*</span></Label>
                  <Input id="email" name="email" type="email" required placeholder="john@example.com" className="border-0 border-b-2 border-border/80 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-base md:text-lg h-auto shadow-none placeholder:text-primary/30 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="organization" className="text-primary/70 font-medium tracking-widest uppercase text-[10px]">Organization / Dept</Label>
                  <Input id="organization" name="organization" placeholder="Optional" className="border-0 border-b-2 border-border/80 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-base md:text-lg h-auto shadow-none placeholder:text-primary/30 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="attending" className="text-primary/70 font-medium tracking-widest uppercase text-[10px]">Will you attend? <span className="text-secondary">*</span></Label>
                  <Select name="attending" required>
                    <SelectTrigger className="border-0 border-b-2 border-border/80 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-base md:text-lg h-auto shadow-none transition-colors">
                      <SelectValue placeholder="Please select..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60 shadow-md">
                      <SelectItem value="attending" className="text-sm md:text-base py-1.5 cursor-pointer">Joyfully Accept</SelectItem>
                      <SelectItem value="maybe" className="text-sm md:text-base py-1.5 cursor-pointer">Maybe</SelectItem>
                      <SelectItem value="cannot_attend" className="text-sm md:text-base py-1.5 cursor-pointer">Regretfully Decline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 w-full md:w-[calc(50%-0.75rem)]">
                <Label htmlFor="guests" className="text-primary/70 font-medium tracking-widest uppercase text-[10px]">Total in Party</Label>
                <Select name="guests" defaultValue="1">
                  <SelectTrigger className="border-0 border-b-2 border-border/80 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent text-base md:text-lg h-auto shadow-none transition-colors">
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 shadow-md">
                    <SelectItem value="1" className="text-sm md:text-base py-1.5 cursor-pointer">1 (Just me)</SelectItem>
                    <SelectItem value="2" className="text-sm md:text-base py-1.5 cursor-pointer">2 Total</SelectItem>
                    <SelectItem value="3" className="text-sm md:text-base py-1.5 cursor-pointer">3 Total</SelectItem>
                    <SelectItem value="4" className="text-sm md:text-base py-1.5 cursor-pointer">4 Total</SelectItem>
                    <SelectItem value="5" className="text-sm md:text-base py-1.5 cursor-pointer">5 Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label htmlFor="message" className="text-primary/70 font-medium tracking-widest uppercase text-[10px]">A Message for D-Love</Label>
                <Textarea id="message" name="message" placeholder="Leave a brief note or memory..." className="border-2 border-border/60 rounded-xl p-3 focus-visible:ring-1 focus-visible:ring-primary bg-white/60 min-h-[100px] resize-y text-base md:text-lg shadow-sm placeholder:text-primary/30 mt-1 transition-all" />
              </div>

              {/* Honeypot */}
              <input type="text" name="_honeypot" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <div className="pt-4 flex flex-col items-center">
                <Button type="submit" className="rounded-full px-8 py-5 text-base md:text-lg font-medium tracking-wide w-full md:w-auto shadow-md hover:shadow-lg transition-all" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting securely..." : "Submit RSVP Response"}
                </Button>
                <p className="text-[9px] md:text-[10px] text-primary/40 mt-3 font-medium uppercase tracking-[0.2em]">
                  Secure Database Submission
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
