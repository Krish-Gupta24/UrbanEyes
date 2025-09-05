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
import { ParkingSpotCard } from "@/components/parking-spot-card";
import { MapPin, Plus, Edit, Trash2, ArrowLeft, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ParkingSpotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSpot, setDeletingSpot] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    pricePerHour: "",
    totalSpots: ""
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

  const createManualSlip = async (spotId) => {
    try {
      const res = await fetch("/api/admin/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parkingSpotId: spotId })
      });
      if (res.ok) {
        toast.success("Slip added, spot occupied");
        fetchSpots();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add slip");
      }
    } catch (e) {
      toast.error("Failed to add slip");
    }
  };

  const deleteManualSlip = async (spotId) => {
    try {
      // Get one manual slip for this spot (bookingId null)
      const listRes = await fetch(`/api/admin/slips?spotId=${spotId}`);
      if (!listRes.ok) {
        toast.error("Failed to fetch slips");
        return;
      }
      const { slips } = await listRes.json();
      const manual = slips.find((s) => !s.bookingId);
      if (!manual) {
        toast.error("No manual slips to delete");
        return;
      }
      const delRes = await fetch(`/api/admin/slips/${manual.id}`, { method: "DELETE" });
      if (delRes.ok) {
        toast.success("Slip removed, spot freed");
        fetchSpots();
      } else {
        const err = await delRes.json();
        toast.error(err.error || "Failed to delete slip");
      }
    } catch (e) {
      toast.error("Failed to delete slip");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title || !formData.address || !formData.pricePerHour) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate price
    if (isNaN(parseFloat(formData.pricePerHour))) {
      toast.error("Please enter a valid price");
      return;
    }
    
    setIsSubmitting(true);
    
    // Use default coordinates for Delhi (simplified)
    const submitData = {
      ...formData,
      latitude: "28.6139",
      longitude: "77.2090",
      description: "Parking spot available for booking"
    };
    
    try {
      const res = await fetch("/api/admin/parking-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        toast.success("Parking spot added successfully!");
        setIsDialogOpen(false);
        setFormData({
          title: "",
          address: "",
          pricePerHour: "",
          totalSpots: ""
        });
        fetchSpots();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add parking spot");
      }
    } catch (error) {
      toast.error("Failed to add parking spot");
    } finally {
      setIsSubmitting(false);
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

  const handleDeleteSpot = async (spotId) => {
    if (!confirm("Are you sure you want to delete this parking spot? This action cannot be undone.")) {
      return;
    }

    setDeletingSpot(spotId);
    try {
      const response = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove the spot from the local state
        setSpots(prev => prev.filter(spot => spot.id !== spotId));
        toast.success("Parking spot deleted successfully");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to delete parking spot: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error deleting parking spot:", err);
      toast.error("Network error occurred while deleting parking spot");
    } finally {
      setDeletingSpot(null);
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
            <h1 className="text-3xl font-bold text-foreground">
              Parking Spots
            </h1>
            <p className="text-muted-foreground">
              Manage your parking spot listings
            </p>
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
                    <Label htmlFor="title">Spot Name</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Downtown Premium Spot"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="123 Main St, Delhi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalSpots">Total Spots</Label>
                    <Input
                      id="totalSpots"
                      type="number"
                      min="0"
                      value={formData.totalSpots}
                      onChange={(e) =>
                        setFormData({ ...formData, totalSpots: e.target.value })
                      }
                      placeholder="150"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerHour">Price per Hour (₹)</Label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      step="0.01"
                      value={formData.pricePerHour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerHour: e.target.value,
                        })
                      }
                      placeholder="50"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Spot"}
                    </Button>
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
              <h3 className="text-lg font-medium text-foreground mb-2">
                No parking spots yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first parking spot to start earning
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Spot
              </Button>
            </div>
          ) : (
<<<<<<< HEAD
            spots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{spot.title}</CardTitle>
                    
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {spot.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {spot.description && (
                    <p className="text-sm text-muted-foreground">
                      {spot.description}
                    </p>
                  )}
=======
            spots.map((spot) => {
              // Transform spot data to match component expectations
              const spotData = {
                ...spot,
                availableSpots: (spot.totalSpots || 0) - (spot.occupiedSpots || 0),
                distance: 0 // Admin view doesn't need distance
              };
              
              return (
                <div key={spot.id} className="space-y-4">
                  <ParkingSpotCard
                    spot={spotData}
                    showDeleteButton={true}
                    onDelete={handleDeleteSpot}
                    isDeleting={deletingSpot === spot.id}
                  />
                  
                  {/* Additional admin controls */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Capacity: {spot.occupiedSpots || 0}/{spot.totalSpots || 0}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => deleteManualSlip(spot.id)}>-</Button>
                          <Button size="sm" onClick={() => createManualSlip(spot.id)}><Plus className="h-4 w-4" /></Button>
                          <Link href={`/admin/parking-spots/${spot.id}`}>
                            <Button size="sm" variant="outline">Details</Button>
                          </Link>
                        </div>
                      </div>
>>>>>>> a05f15756f7c57f1f9a89cfeb46f0a301ac98227

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
                      </div>
                    </div>
<<<<<<< HEAD
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{spot._count?.bookings || 0} bookings</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Capacity: {spot.occupiedSpots || 0}/{spot.totalSpots || 0}
                    </span>
                    <div className="flex items-center gap-2">
                    
                      <Link href={`/admin/parking-spots/${spot.id}`}>
                        <Button size="sm" variant="outline">Details</Button>
                      </Link>
                    </div>
                  </div>

                
                </CardContent>
              </Card>
            ))
=======
                  </Card>
                </div>
              );
            })
>>>>>>> a05f15756f7c57f1f9a89cfeb46f0a301ac98227
          )}
        </div>
      </div>
    </div>
  );
}
