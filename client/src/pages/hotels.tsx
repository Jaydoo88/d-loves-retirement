import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import hotelImage from "@/assets/images/hotel.jpg";
import derbyHotelImage from "@/assets/images/derby_hotel.png";
import wingateHotelImage from "@/assets/images/wingate_hotel.png";
import candlewoodHotelImage from "@/assets/images/candlewood_hotel.png";
import holidayInnHotelImage from "@/assets/images/holiday_inn_hotel.png";
import { ExternalLink, MapPin, Phone, Car, Wifi, Coffee, Star } from "lucide-react";

const hotels = [
  {
    name: "Derby City Gaming Hotel",
    distance: "~1.9 miles from venue",
    price: "~$149",
    desc: "Premium stay with gaming and entertainment. Call 502-961-7600 and use code 'Johnson Retirement Party' for a $25 casino credit.",
    link: "https://hotel.derbycitygaming.com/hotel/",
    address: "4520 Poplar Level Rd, Louisville, KY",
    phone: "502-961-7600",
    amenities: ["Complimentary Parking", "High-Speed WiFi", "24-Hour Guest Services", "Signature Dining & Bars", "Sportsbook & Gaming Lounge", "ADA-Accessible Facilities"],
    image: derbyHotelImage,
    badge: "Most Popular"
  },
  {
    name: "Wingate by Wyndham Louisville Fair and Expo",
    distance: "~2.1 miles from venue",
    price: "~$116",
    desc: "Comfortable rooms in a convenient location. Group-friendly and pet-friendly accommodations.",
    link: "https://www.wyndhamhotels.com/wingate/louisville-kentucky/wingate-by-wyndham-louisville-fair-and-expo/overview",
    address: "3200 Kemmons Drive, Louisville, KY",
    phone: "502-694-4726",
    amenities: ["Complimentary Breakfast", "Complimentary Parking", "High-Speed WiFi", "Fitness Center", "Outdoor Pool", "Pet-Friendly"],
    image: wingateHotelImage
  },
  {
    name: "Candlewood Suites Louisville Airport",
    distance: "~1.1 miles from venue",
    price: "~$123",
    desc: "Extended stay suites perfect for longer visits or those needing home-like amenities.",
    link: "https://www.ihg.com/candlewood/hotels/us/en/louisville/sdfgl/hoteldetail",
    address: "1367 Gardiner Lane, Louisville, KY",
    phone: "502-357-3577",
    amenities: ["Full In-Suite Kitchens", "Free High-Speed WiFi", "Complimentary Guest Laundry (24/7)", "Fitness Center", "Pet-Friendly Rooms", "Free On-Site Parking"],
    image: candlewoodHotelImage
  },
  {
    name: "Holiday Inn Express Louisville Airport Expo",
    distance: "~1.9 miles from venue",
    price: "~$108",
    desc: "Modern and reliable accommodations close to the airport and local attractions.",
    link: "https://www.ihg.com/holidayinn/hotels/us/en/louisville/sdfcd/hoteldetail",
    address: "1921 Bishop Lane, Louisville, KY",
    phone: "502-637-4500",
    amenities: ["Free Airport Shuttle", "Indoor Swimming Pool", "On-Site Restaurant & Bar", "Free High-Speed Wi-Fi", "Fitness Center", "Free Parking"],
    image: holidayInnHotelImage
  }
];

export default function Hotels() {
  return (
    <Layout>
      {/* Clean Header Section */}
      <section className="pt-12 pb-8 bg-white text-center px-4 border-b border-border/50 animate-in fade-in slide-in-from-top-4">
        <h1 className="font-serif text-5xl md:text-6xl text-primary font-bold mb-6">
          Lodging & Accommodations
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
          We have secured special rates at several premier hotels in the area for out-of-town guests.
        </p>
      </section>

      <section className="py-12 bg-muted/20 min-h-[calc(100vh-350px)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {hotels.map((hotel, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className="h-56 overflow-hidden relative">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  {hotel.badge && (
                    <div className="absolute bottom-4 left-4 bg-primary/90 text-white backdrop-blur-md font-medium px-4 py-1.5 rounded-full shadow-lg text-sm tracking-wide border border-white/10 uppercase">
                      {hotel.badge}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-primary font-bold px-3 py-1 rounded shadow-sm text-sm">
                    {hotel.price}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-2xl text-primary font-bold mb-2 min-h-[4rem] flex items-start">{hotel.name}</h3>
                  
                  <div className="flex flex-col text-sm text-muted-foreground mb-4 font-medium space-y-1">
                    <div className="flex items-start">
                      <MapPin size={16} className="mr-1 mt-0.5 text-secondary flex-shrink-0" />
                      <span>{hotel.address}</span>
                    </div>
                    <div className="pl-5 text-xs text-muted-foreground/80">
                      {hotel.distance}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-8 line-clamp-3 text-sm leading-relaxed">
                    {hotel.desc}
                  </p>

                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 border-border text-primary hover:bg-muted/50">
                          More Info
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-serif text-3xl text-primary">{hotel.name}</DialogTitle>
                          <DialogDescription className="flex flex-col gap-1 pt-2">
                            <div className="flex items-start">
                              <MapPin size={16} className="mr-1 mt-0.5 text-secondary flex-shrink-0" />
                              <span>{hotel.address}</span>
                            </div>
                            <div className="pl-5 text-xs text-muted-foreground/80">
                              {hotel.distance}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm" />
                          <p className="text-muted-foreground leading-relaxed mb-6">{hotel.desc}</p>
                          
                          <h4 className="font-semibold text-primary mb-3">Amenities</h4>
                          <div className="grid grid-cols-2 gap-3 mb-8">
                            {hotel.amenities.map(amenity => (
                              <div key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                                {amenity.includes("Wifi") && <Wifi size={16} className="text-primary/60" />}
                                {amenity.includes("Parking") && <Car size={16} className="text-primary/60" />}
                                {amenity.includes("Breakfast") && <Coffee size={16} className="text-primary/60" />}
                                {!amenity.includes("Wifi") && !amenity.includes("Parking") && !amenity.includes("Breakfast") && <Star size={16} className="text-primary/60" />}
                                {amenity}
                              </div>
                            ))}
                          </div>

                          <div className="bg-muted/30 p-4 rounded-xl flex items-center justify-between border border-border">
                            <div>
                              <p className="text-sm font-semibold text-primary">Need assistance?</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone size={12}/> {hotel.phone || "(555) 123-4567"}</p>
                            </div>
                            <Button className="rounded-full px-6" onClick={() => window.open(hotel.link, '_blank')}>
                              Book Now <ExternalLink size={14} className="ml-2" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button className="flex-1 shadow-md" onClick={() => window.open(hotel.link, '_blank')}>
                      Book Room <ExternalLink size={16} className="ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
