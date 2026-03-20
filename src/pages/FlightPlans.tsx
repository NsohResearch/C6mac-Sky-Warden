import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { REGION_CONFIGS, type RegionCode } from "@/lib/region-config";
import { MapPin, Plus, Trash2, Navigation, Plane, Clock, ArrowUp, Save, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Waypoint {
  id: string;
  name: string;
  lat: string;
  lng: string;
  altitude_ft: number;
  speed_kts: number;
  action: 'flyover' | 'orbit' | 'hover' | 'survey';
}

const FLIGHT_RULES = ['VFR', 'IFR', 'SVFR'] as const;
const CORRIDOR_WIDTHS = [50, 100, 200, 500, 1000];

export default function FlightPlans() {
  const { profile } = useAuth();
  const region = (profile?.region ?? 'US') as RegionCode;
  const regionConfig = REGION_CONFIGS[region];

  const [planName, setPlanName] = useState('');
  const [flightRules, setFlightRules] = useState<typeof FLIGHT_RULES[number]>('VFR');
  const [corridorWidth, setCorridorWidth] = useState(100);
  const [maxAltitude, setMaxAltitude] = useState(400);
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: crypto.randomUUID(), name: 'Launch', lat: '', lng: '', altitude_ft: 0, speed_kts: 0, action: 'flyover' },
  ]);
  const [saving, setSaving] = useState(false);

  const { data: drones } = useQuery({
    queryKey: ['drones-for-plan'],
    queryFn: async () => {
      const { data } = await supabase.from('drones').select('id, nickname, manufacturer, model').limit(50);
      return data ?? [];
    },
  });
  const [selectedDrone, setSelectedDrone] = useState('');

  const addWaypoint = () => {
    setWaypoints(wp => [...wp, {
      id: crypto.randomUUID(), name: `WP${wp.length}`, lat: '', lng: '',
      altitude_ft: maxAltitude, speed_kts: 15, action: 'flyover',
    }]);
  };

  const removeWaypoint = (id: string) => {
    if (waypoints.length <= 1) return;
    setWaypoints(wp => wp.filter(w => w.id !== id));
  };

  const updateWaypoint = (id: string, field: keyof Waypoint, value: any) => {
    setWaypoints(wp => wp.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleSave = async () => {
    if (!planName) {
      toast({ title: 'Name required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const waypointsJson = waypoints.map((wp, i) => ({
        sequence: i,
        name: wp.name,
        latitude: parseFloat(wp.lat) || 0,
        longitude: parseFloat(wp.lng) || 0,
        altitude_ft: wp.altitude_ft,
        speed_kts: wp.speed_kts,
        action: wp.action,
      }));

      const insertData: Record<string, unknown> = {
        tenant_id: profile!.tenant_id,
        region: region,
        title: planName,
        mission_type: flightRules === 'IFR' ? 'instrument' : 'visual',
        status: 'draft',
        max_altitude_ft: maxAltitude,
        drone_id: selectedDrone || null,
        pilot_id: profile!.id,
        waypoints: waypointsJson,
        description: `${flightRules} flight plan · ${corridorWidth}m corridor · ${waypoints.length} waypoints`,
        operation_area: {
          type: 'corridor',
          width_meters: corridorWidth,
          flight_rules: flightRules,
          estimated_duration: estimatedDuration,
        },
      };
      const { error } = await supabase.from('missions').insert(insertData as any);
      if (error) throw error;
      toast({ title: 'Flight plan saved', description: `"${planName}" created as draft mission.` });
      setPlanName('');
      setWaypoints([{ id: crypto.randomUUID(), name: 'Launch', lat: '', lng: '', altitude_ft: 0, speed_kts: 0, action: 'flyover' }]);
    } catch (err: any) {
      toast({ title: 'Failed to save', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flight Plans</h1>
          <p className="text-sm text-muted-foreground">IFR/VFR-style route planning with corridor buffers</p>
        </div>
        <Badge variant="outline" className="text-xs">{regionConfig.authorityAcronym}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-accent" /> Plan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Plan Name *</Label>
              <Input placeholder="e.g., Site Survey Alpha" value={planName} onChange={e => setPlanName(e.target.value)} />
            </div>
            <div>
              <Label>Flight Rules</Label>
              <Select value={flightRules} onValueChange={v => setFlightRules(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FLIGHT_RULES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned Drone</Label>
              <Select value={selectedDrone} onValueChange={setSelectedDrone}>
                <SelectTrigger><SelectValue placeholder="Select drone" /></SelectTrigger>
                <SelectContent>
                  {(drones ?? []).map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nickname || `${d.manufacturer} ${d.model}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /> Max Alt (ft)</Label>
                <Input type="number" value={maxAltitude} onChange={e => setMaxAltitude(parseInt(e.target.value) || 400)} />
              </div>
              <div>
                <Label>Corridor (m)</Label>
                <Select value={corridorWidth.toString()} onValueChange={v => setCorridorWidth(parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CORRIDOR_WIDTHS.map(w => <SelectItem key={w} value={w.toString()}>{w}m</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="h-3 w-3" /> Est. Duration</Label>
              <Input placeholder="e.g., 45 min" value={estimatedDuration} onChange={e => setEstimatedDuration(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSave} disabled={saving}>
                <Save className="mr-1 h-4 w-4" /> {saving ? 'Saving…' : 'Save Plan'}
              </Button>
              <Button variant="outline" size="icon" onClick={() => {
                setPlanName('');
                setWaypoints([{ id: crypto.randomUUID(), name: 'Launch', lat: '', lng: '', altitude_ft: 0, speed_kts: 0, action: 'flyover' }]);
              }}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Waypoints */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-accent" /> Waypoints ({waypoints.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addWaypoint}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Waypoint
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waypoints.map((wp, idx) => (
                <div key={wp.id} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                        {idx + 1}
                      </div>
                      <Input
                        className="h-7 w-28 text-xs font-medium"
                        value={wp.name}
                        onChange={e => updateWaypoint(wp.id, 'name', e.target.value)}
                      />
                      <Badge variant="secondary" className="text-[10px]">{wp.action}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeWaypoint(wp.id)} disabled={waypoints.length <= 1}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <div>
                      <Label className="text-[10px]">Latitude</Label>
                      <Input className="h-7 text-xs" placeholder="0.0000" value={wp.lat} onChange={e => updateWaypoint(wp.id, 'lat', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Longitude</Label>
                      <Input className="h-7 text-xs" placeholder="0.0000" value={wp.lng} onChange={e => updateWaypoint(wp.id, 'lng', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Alt (ft)</Label>
                      <Input className="h-7 text-xs" type="number" value={wp.altitude_ft} onChange={e => updateWaypoint(wp.id, 'altitude_ft', parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Speed (kts)</Label>
                      <Input className="h-7 text-xs" type="number" value={wp.speed_kts} onChange={e => updateWaypoint(wp.id, 'speed_kts', parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-[10px]">Action</Label>
                      <Select value={wp.action} onValueChange={v => updateWaypoint(wp.id, 'action', v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flyover">Flyover</SelectItem>
                          <SelectItem value="orbit">Orbit</SelectItem>
                          <SelectItem value="hover">Hover</SelectItem>
                          <SelectItem value="survey">Survey</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Route Summary */}
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Route Summary</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Waypoints</p>
                  <p className="font-semibold">{waypoints.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Flight Rules</p>
                  <p className="font-semibold">{flightRules}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Corridor</p>
                  <p className="font-semibold">{corridorWidth}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Altitude</p>
                  <p className="font-semibold">{maxAltitude} ft AGL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
