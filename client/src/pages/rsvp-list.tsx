import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, RefreshCw, Link as LinkIcon, Users, CheckCircle, XCircle, HelpCircle, Search, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RsvpList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRsvps = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      if (data) setRsvps(data);
    } catch (err: any) {
      console.error("Error fetching RSVPs:", err);
      toast({
        title: "Error Loading Data",
        description: err.message || "Could not fetch RSVP data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRsvps();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast({ title: "Link Copied", description: "Event link copied to clipboard." });
  };

  const handleRefresh = () => {
    fetchRsvps();
  };

  const filteredRsvps = rsvps.filter(r => 
    (r.full_name && r.full_name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (r.organization && r.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.status && r.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalResponses = rsvps.length;
  const totalAttending = rsvps.filter(r => r.status === 'attending').length;
  const totalCannotAttend = rsvps.filter(r => r.status === 'cannot_attend').length;
  const totalMaybe = rsvps.filter(r => r.status === 'maybe').length;
  const totalConfirmedPeople = rsvps.reduce((acc, r) => r.status === 'attending' ? acc + (r.guest_count || 0) : acc, 0);

  return (
    <Layout>
      <section className="py-8 bg-muted/20 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="font-serif text-4xl text-primary font-bold">RSVP Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage guest responses for Officer Johnson's retirement</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyLink} className="bg-white">
                <LinkIcon size={16} className="mr-2" /> Share Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-white">
                <RefreshCw size={16} className="mr-2" /> Refresh
              </Button>
              <Button className="bg-secondary text-white hover:bg-secondary/90" size="sm">
                <Download size={16} className="mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Responses</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{totalResponses}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attending</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-3xl font-bold">{totalAttending}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-red-500">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cannot Attend</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-3xl font-bold">{totalCannotAttend}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Maybe</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-3xl font-bold">{totalMaybe}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-accent">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Confirmed People</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-3xl font-bold">{totalConfirmedPeople}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table Section */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-white flex justify-between items-center">
              <h3 className="font-semibold text-lg">Response List</h3>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, org, or status..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardContent className="p-0 bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[180px]">Full Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center w-[100px]">Guests</TableHead>
                      <TableHead className="w-[150px]">Organization</TableHead>
                      <TableHead className="max-w-[400px]">Message / Memory</TableHead>
                      <TableHead className="text-right">Submission Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Loading RSVPs...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredRsvps.map((rsvp) => (
                      <TableRow key={rsvp.id} className="hover:bg-muted/10">
                        <TableCell className="font-medium text-primary">{rsvp.full_name}</TableCell>
                        <TableCell>
                          {rsvp.status === 'attending' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-none font-medium">Attending</Badge>}
                          {rsvp.status === 'cannot_attend' && <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 shadow-none font-medium">Declined</Badge>}
                          {rsvp.status === 'maybe' && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-0 shadow-none font-medium">Maybe</Badge>}
                        </TableCell>
                        <TableCell className="text-center font-medium">{rsvp.guest_count}</TableCell>
                        <TableCell className="text-muted-foreground">{rsvp.organization || "-"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {rsvp.message ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <span className="cursor-pointer hover:text-primary underline-offset-4 hover:underline block max-w-[400px] truncate flex items-center gap-1" title="Click to read full message">
                                  <MessageSquare size={12} className="shrink-0" /> <span className="truncate">{rsvp.message}</span>
                                </span>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Message from {rsvp.full_name}</DialogTitle>
                                </DialogHeader>
                                <div className="p-4 bg-muted/20 rounded-md text-foreground whitespace-pre-wrap">
                                  {rsvp.message}
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-muted-foreground/40 italic">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {new Date(rsvp.submitted_at).toLocaleDateString()} {new Date(rsvp.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && filteredRsvps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          {searchTerm ? "No responses found matching your search." : "No RSVPs received yet."}
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
