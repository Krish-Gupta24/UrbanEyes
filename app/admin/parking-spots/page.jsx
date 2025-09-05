"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Edit, Trash2, ArrowLeft, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ParkingSpotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    pricePerHour: ""
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    if (session.user?.role !== "OWNER") {
      router.push("/");
      return;
    }

    fetchSpots();
  }, [session, status, router]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/parking-spots");
      if (res.ok) {
        const data = await res.json();
        setSpots(data.parkingSpots);
      }
    } catch (error) {
      toast.error("Failed to load parking spots");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/admin/parking-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Parking spot added successfully");
        setIsDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          address: "",
          latitude: "",
          longitude: "",
          pricePerHour: ""
        });
        fetchSpots();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add parking spot");
      }
    } catch (error) {
      toast.error("Failed to add parking spot");
    }
  };

  const toggleAvailability = async (spotId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });

      if (res.ok) {
        toast.success("Availability updated");
        fetchSpots();
      } else {
        toast.error("Failed to update availability");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "OWNER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Parking Spots</h1>
            <p className="text-muted-foreground">Manage your parking spot listings</p>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Spot</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Parking Spot</DialogTitle>
                  <DialogDescription>
                    Create a new parking spot listing for customers to book.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Downtown Premium Spot"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your parking spot..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="40.7128"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="-74.0060"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      step="0.01"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                      placeholder="5.00"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Spot</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Parking Spots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No parking spots yet</h3>
              <p className="text-muted-foreground mb-4">Add your first parking spot to start earning</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Spot
              </Button>
            </div>
          ) : (
            spots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{spot.title}</CardTitle>
                    <Badge variant={spot.isAvailable ? "default" : "secondary"}>
                      {spot.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {spot.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {spot.description && (
                    <p className="text-sm text-muted-foreground">{spot.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${spot.pricePerHour}/hour</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{spot._count?.bookings || 0} bookings</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(spot.id, spot.isAvailable)}
                      className="flex-1"
                    >
                      {spot.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
