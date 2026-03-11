import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import golfHero from "@/assets/images/golf_hero_new.png";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Info, Users, Download, RefreshCw, Link as LinkIcon, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GolfOuting() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [golfers, setGolfers] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<{name: string, note: string} | null>(null);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('golf_registrations')
        .select('*')
        .eq('registration_type', 'golf')
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      if (data) setGolfers(data);
    } catch (err: any) {
      console.error("Error fetching registrations:", err);
      toast({
        title: "Error Loading Data",
        description: err.message || err.toString() || "Could not connect to the database. Please check your Supabase configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleGolfSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get('_honeypot');
    
    if (honeypot) {
      setIsSubmitting(false);
      return; // Basic bot protection
    }

    const newRegistration = {
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      handicap_range: formData.get('handicap') as string,
      party_size: parseInt(formData.get('party_size') as string, 10),
      pairing_preference: formData.get('pairing_preference') as string,
      notes: formData.get('notes') as string,
      registration_type: 'golf',
      source: 'site_form',
      submitted_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('golf_registrations')
        .insert([newRegistration]);

      if (error) throw error;

      toast({
        title: "Golf Registration Confirmed",
        description: "Your registration has been securely saved.",
      });
      
      (e.target as HTMLFormElement).reset();
      fetchRegistrations(); // Refresh the list
    } catch (err: any) {
      console.error("Error submitting form:", err);
      toast({
        title: "Registration Failed",
        description: err.message || "There was a problem submitting your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/golf");
    toast({ title: "Link Copied", description: "Golf outing link copied to clipboard." });
  };

  const filteredGolfers = golfers.filter(g => 
    (g.full_name && g.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (g.pairing_preference && g.pairing_preference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats Calculations
  const totalSignups = golfers.length;
  const totalPlayers = golfers.reduce((acc, g) => acc + (g.party_size || 0), 0);
  const fullFoursomes = Math.floor(totalPlayers / 4);
  const remainingPlayers = totalPlayers % 4;

  return (
    <Layout>
      {/* Clean Header Section */}
      <section className="pt-12 pb-8 bg-white text-center px-4 border-b border-border/50 animate-in fade-in slide-in-from-top-4">
        <span className="text-secondary uppercase tracking-widest text-sm font-bold mb-4 block">Pre-Event Celebration</span>
        <h1 className="font-serif text-5xl md:text-6xl text-primary font-bold mb-6">
          Commemorative Golf Outing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
          Hit the links with D-Love before the main ceremony.
        </p>
      </section>

      {/* Banner Image */}
      <div className="w-full h-64 md:h-96 relative">
        <img 
          src={golfHero} 
          alt="Golf Course" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/10" />
      </div>

      {/* Details & Registration Form */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Details Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-xl border-0 overflow-hidden bg-white">
                <div className="h-2 w-full bg-secondary" />
                <CardContent className="p-8">
                  <h3 className="font-serif text-2xl text-primary font-bold mb-6">Outing Details</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Calendar className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-primary">Friday, May 22, 2026</p>
                        <p className="text-sm text-muted-foreground">The day before the ceremony</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-primary">TBD Shotgun Start</p>
                        <p className="text-sm text-muted-foreground">Check-in time TBD</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-primary">Oxmoor Country Club</p>
                        <p className="text-sm text-muted-foreground">9000 Limehouse Ln, Louisville, KY 40220</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Info className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-primary">Format: 4-Person Scramble</p>
                        <p className="text-sm text-muted-foreground">Price TBD (includes cart & green fees)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <LinkIcon className="text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-primary">Website</p>
                        <a href="http://oxmoorcountryclub.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-secondary underline">oxmoorcountryclub.com</a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signup Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white">
                <CardContent className="p-8 md:p-10">
                  <h2 className="font-serif text-3xl text-primary font-bold mb-2">Register to Play</h2>
                  <p className="text-muted-foreground mb-8">Secure your spot or register an entire foursome.</p>

                  <form onSubmit={handleGolfSignup} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-primary font-medium">Name <span className="text-secondary">*</span></Label>
                        <Input id="full_name" name="full_name" required placeholder="First Last" className="bg-muted/30 focus-visible:ring-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-primary font-medium">Email Address <span className="text-secondary">*</span></Label>
                        <Input id="email" name="email" type="email" required placeholder="For updates and info" className="bg-muted/30 focus-visible:ring-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="handicap" className="text-primary font-medium">Skill Level</Label>
                        <Select name="handicap" defaultValue="New to Golf">
                          <SelectTrigger className="bg-muted/30 focus-visible:ring-primary">
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New to Golf">New to Golf</SelectItem>
                            <SelectItem value="Casual Player">Casual Player</SelectItem>
                            <SelectItem value="Regular Player">Regular Player</SelectItem>
                            <SelectItem value="Competitive Player">Competitive Player</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="party_size" className="text-primary font-medium">Total Players Registering <span className="text-secondary">*</span></Label>
                        <Select name="party_size" required defaultValue="1">
                          <SelectTrigger className="bg-muted/30 focus-visible:ring-primary">
                            <SelectValue placeholder="Select party size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Player</SelectItem>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="3">3 Players</SelectItem>
                            <SelectItem value="4">4 Players (Full Foursome)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pairing_preference" className="text-primary font-medium">Pairing Preferences & Other Player Names</Label>
                      <Input id="pairing_preference" name="pairing_preference" placeholder="Who would you like to play with?" className="bg-muted/30 focus-visible:ring-primary" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-primary font-medium">Additional Notes / Rental Requests</Label>
                      <Textarea id="notes" name="notes" placeholder="Any special requests or club rentals needed?" className="bg-muted/30 min-h-[80px] focus-visible:ring-primary" />
                    </div>

                    <input type="text" name="_honeypot" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                    <div className="pt-6 flex justify-center">
                      <Button type="submit" className="w-full max-w-[320px] py-6 text-lg shadow-md" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Securely Registering...
                          </>
                        ) : "Submit Golf Registration"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Golf Participant List Section */}
      <section className="py-12 bg-white border-t border-border/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="font-serif text-3xl text-primary font-bold">Golf Participants List</h2>
              <p className="text-muted-foreground mt-1">Manage tournament pairings and sign-ups</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyLink} className="bg-white">
                <LinkIcon size={16} className="mr-2" /> Share Link
              </Button>
              <Button variant="outline" size="sm" className="bg-white" onClick={fetchRegistrations} disabled={isLoading}>
                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button className="bg-secondary text-white hover:bg-secondary/90" size="sm">
                <Download size={16} className="mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Golf Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="shadow-sm border-0 bg-muted/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sign-ups</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">{totalSignups}</span>
                  <span className="text-xs text-muted-foreground ml-1">entries</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-muted/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Players</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold text-primary">{totalPlayers}</span>
                  <span className="text-xs text-muted-foreground ml-1">golfers</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-muted/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Foursomes</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-primary">{fullFoursomes}</span>
                  <span className="text-xs text-muted-foreground ml-1">teams</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0 bg-muted/20">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unpaired Players</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-secondary">{remainingPlayers}</span>
                  <span className="text-xs text-muted-foreground ml-1">need a group</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Golf Data Table */}
          <Card className="border-0 shadow-lg overflow-hidden bg-white">
            <div className="p-4 border-b border-border/50 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-primary">Registration Data</h3>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search names or preferences..."
                  className="pl-9 bg-muted/30 border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[180px] font-semibold">Name</TableHead>
                      <TableHead className="text-center font-semibold">Party Size</TableHead>
                      <TableHead className="font-semibold">Skill Level</TableHead>
                      <TableHead className="font-semibold">Pairing Preferences</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                      <TableHead className="text-right font-semibold">Sign-up Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Loading registrations...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredGolfers.length > 0 ? (
                      filteredGolfers.map((golfer) => (
                        <TableRow key={golfer.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-primary">{golfer.full_name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={golfer.party_size === 4 ? "default" : "outline"} className={golfer.party_size === 4 ? "bg-primary text-white border-0 shadow-none" : "border-border shadow-none text-muted-foreground"}>
                              {golfer.party_size}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{golfer.handicap_range || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{golfer.pairing_preference || "-"}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {golfer.notes ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <span className="cursor-pointer hover:text-primary underline-offset-4 hover:underline block max-w-[200px] truncate" title="Click to read full note">
                                    {golfer.notes}
                                  </span>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Note from {golfer.full_name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-4 bg-muted/20 rounded-md text-foreground whitespace-pre-wrap">
                                    {golfer.notes}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-muted-foreground/50">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(golfer.submitted_at).toLocaleDateString()} {new Date(golfer.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {searchTerm ? "No registrations matching your search." : "No golf registrations found yet."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>
    </Layout>
  );
}
