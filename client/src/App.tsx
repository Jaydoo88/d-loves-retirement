import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Venue from "@/pages/venue";
import GolfOuting from "@/pages/golf-outing";
import Hotels from "@/pages/hotels";
import RsvpList from "@/pages/rsvp-list";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/venue" component={Venue} />
      <Route path="/golf" component={GolfOuting} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/rsvp-list" component={RsvpList} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
