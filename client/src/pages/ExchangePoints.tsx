import { useRef, useState, useEffect } from "react";
import { Loader2, Plus, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Vite/React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function LocationMarker({ setLat, setLng, setDialogOpen }: any) {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      toast.info("Location selected! Click 'Add Point' to save this spot.");
      // Optional: Auto open dialog?
      // setDialogOpen(true);
    },
  });
  return null;
}

// Component to update map center when selecting a point
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function ExchangePoints() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null); // For sidebar/popup info

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(31.5204); // Default Lahore
  const [lng, setLng] = useState(74.3587);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPoints();
  }, [user]);

  const fetchPoints = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/exchange-points`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPoints(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoint = async () => {
    if (!user) return toast.error("Login required");
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/exchange-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description: desc, address, latitude: lat, longitude: lng })
      });
      if (res.ok) {
        toast.success("Exchange Point Added!");
        setDialogOpen(false);
        fetchPoints();
        // Reset form
        setName(""); setDesc(""); setAddress("");
      } else {
        const err = await res.json();
        toast.error(err.error?.message || "Failed to add point");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-white border-b p-4 flex items-center justify-between z-10 shadow-sm relative">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="text-accent" /> Exchange Points
          </h1>
          <p className="text-sm text-muted-foreground">Find physical exchange stalls on the map</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Add My Point
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exchange Point</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Book Stall" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details..." />
              </div>
              <div className="grid gap-2">
                <Label>Address (Optional)</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Street..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Lat</Label>
                  <Input value={lat} readOnly />
                </div>
                <div>
                  <Label>Lng</Label>
                  <Input value={lng} readOnly />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Click on the map to update coordinates.</p>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePoint}>Save Point</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 h-full z-0">
          <MapContainer
            center={[31.5204, 74.3587]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker setLat={setLat} setLng={setLng} setDialogOpen={setDialogOpen} />

            {selectedPoint && (
              <MapUpdater center={[selectedPoint.latitude, selectedPoint.longitude]} />
            )}

            {points.map((p) => (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                eventHandlers={{
                  click: () => {
                    setSelectedPoint(p);
                  },
                }}
              >
                {/* We can put Popup here too if we want direct popups */}
              </Marker>
            ))}

            {/* Show temporary marker for selected location during creation */}
            {dialogOpen && (
              <Marker position={[lat, lng]} opacity={0.6} />
            )}

          </MapContainer>
        </div>

        {/* Sidebar Info - Overlay or Side Panel */}
        {selectedPoint && (
          <div className="w-80 bg-white border-l shadow-xl overflow-y-auto p-4 absolute right-0 top-0 bottom-0 z-[1000] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">{selectedPoint.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPoint(null)}>X</Button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-secondary/10 px-2 py-1 rounded-full text-secondary-foreground font-medium">
                Owned by {selectedPoint.owner?.name || "Unknown"}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{selectedPoint.description}</p>

            {selectedPoint.address && (
              <div className="flex items-center gap-2 text-sm mb-6 text-slate-600">
                <MapPin className="w-4 h-4" />
                {selectedPoint.address}
              </div>
            )}

            <div className="grid gap-2">
              <h3 className="font-semibold text-sm">Owner Actions</h3>

              <Link href={`/browse?ownerId=${selectedPoint.ownerId}`}>
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" /> View Listings
                </Button>
              </Link>

              {/* Message Owner */}
              <Button
                className="w-full"
                onClick={async () => {
                  if (!user) return toast.error("Login required");
                  try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/chats`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ participantIds: [user.id, selectedPoint.ownerId] })
                    });
                    if (res.ok) {
                      const chat = await res.json();
                      const initialMessage = encodeURIComponent(`Hi, I found your exchange point "${selectedPoint.name}" on the map and would like to visit.`);
                      setLocation(`/messages?chatId=${chat.id}&initialMessage=${initialMessage}`);
                    }
                  } catch (e) { console.error(e) }
                }}
              >
                Message Owner
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
