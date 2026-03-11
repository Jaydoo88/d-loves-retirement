import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel3D } from "@/components/ui/3d-carousel";
import venueImage from "@/assets/images/venue_hero_new.png";
import venueInterior from "@/assets/images/venue_interior_new.png";
import venueExterior from "@/assets/images/venue_exterior_new.png";
import venuePic1 from "@/assets/images/venue_pic_1.png";
import venuePic2 from "@/assets/images/venue_pic_2.png";
import venuePic3 from "@/assets/images/venue_pic_3.png";
import venuePic4 from "@/assets/images/venue_pic_4.png";
import venuePic5 from "@/assets/images/venue_pic_5.png";
import venuePic6 from "@/assets/images/venue_pic_6.png";
import venuePic7 from "@/assets/images/venue_pic_7.png";
import { MapPin, Navigation, Globe, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const venueGallery = [
  venueInterior, 
  venueExterior, 
  venueImage,
  venuePic1,
  venuePic2,
  venuePic3,
  venuePic4,
  venuePic5,
  venuePic6,
  venuePic7
];

export default function Venue() {
  return (
    <Layout>
      {/* Clean Header Section */}
      <section className="pt-12 pb-8 bg-white text-center px-4 border-b border-border/50 animate-in fade-in slide-in-from-top-4">
        <span className="text-secondary uppercase tracking-widest text-sm font-bold mb-4 block">Event Location</span>
        <h1 className="font-serif text-5xl md:text-6xl text-primary font-bold mb-6">
          German American Club
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light flex items-center justify-center gap-2">
          <MapPin className="text-secondary" /> 1840 Lincoln Ave, Louisville, KY 40213
        </p>
      </section>

      {/* Hero Banner Image */}
      <div className="w-full h-[400px] md:h-[500px] relative">
        <img 
          src={venueImage} 
          alt="German American Club Exterior" 
          className="w-full h-full object-cover object-center"
        />
      </div>

      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-4xl text-primary font-bold mb-6">A Fitting Setting</h2>
                <div className="w-12 h-1 bg-secondary mb-6"></div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The German American Club has been selected for its welcoming atmosphere and historic charm. The venue features a spacious hall and a standard of service perfectly suited for this celebration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-primary">Parking</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Convenient on-site parking is available, with overflow parking nearby if needed.</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-primary">Accessibility</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">The venue is ADA accessible. Please share any accommodation needs with us in advance.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-6">
                <a href="https://www.google.com/maps?q=1840+Lincoln+Ave,+Louisville,+KY+40213" target="_blank" rel="noopener noreferrer">
                  <Button className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <MapPin className="mr-2" size={20} /> Get Directions
                  </Button>
                </a>
              </div>
            </div>

            {/* Interactive 3D Gallery */}
            <div className="w-full h-full flex items-center justify-center pt-8 lg:pt-0">
              <Carousel3D images={venueGallery} />
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
