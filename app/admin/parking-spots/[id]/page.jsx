"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";

export default function ParkingSpotDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const spotId = params?.id;

  const [spot, setSpot] = useState(null);
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCapacity, setUpdatingCapacity] = useState(false);
  const [newTotal, setNewTotal] = useState("");

  const freeSpots = useMemo(() => {
    if (!spot) return 0;
    const total = spot.totalSpots || 0;
    const occ = spot.occupiedSpots || 0;
    return Math.max(total - occ, 0);
  }, [spot]);

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

    if (!spotId) return;

    fetchAll();
  }, [session, status, router, spotId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [spotRes, slipsRes] = await Promise.all([
        fetch(`/api/admin/parking-spots/${spotId}`),
        fetch(`/api/admin/slips?spotId=${spotId}`)
      ]);
      if (spotRes.ok) {
        const { parkingSpot } = await spotRes.json();
        setSpot(parkingSpot);
        setNewTotal(String(parkingSpot.totalSpots || ""));
      }
      if (slipsRes.ok) {
        const { slips } = await slipsRes.json();
        setSlips(slips);
      }
    } catch (e) {
      toast.error("Failed to load spot details");
    } finally {
      setLoading(false);
    }
  };

  const createManualSlip = async () => {
    try {
      const res = await fetch("/api/admin/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parkingSpotId: spotId })
      });
      if (res.ok) {
        toast.success("Slip created");
        fetchAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create slip");
      }
    } catch (e) {
      toast.error("Failed to create slip");
    }
  };

  const deleteSlip = async (slipId) => {
    try {
      const res = await fetch(`/api/admin/slips/${slipId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Slip deleted");
        fetchAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete slip");
      }
    } catch (e) {
      toast.error("Failed to delete slip");
    }
  };

  const updateCapacity = async (e) => {
    e.preventDefault();
    try {
      setUpdatingCapacity(true);
      const res = await fetch(`/api/admin/parking-spots/${spotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalSpots: newTotal })
      });
      if (res.ok) {
        toast.success("Capacity updated");
        fetchAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update capacity");
      }
    } catch (e) {
      toast.error("Failed to update capacity");
    } finally {
      setUpdatingCapacity(false);
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

  if (!spot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/admin/parking-spots">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">Parking spot not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{spot.title}</h1>
            <p className="text-muted-foreground flex items-center"><MapPin className="h-4 w-4 mr-1"/>{spot.address}</p>
          </div>
          <Link href="/admin/parking-spots">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Spots</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Capacity</CardTitle>
              <CardDescription>Manage total and available spots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">{spot.totalSpots || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Occupied</span>
                <span className="font-medium">{spot.occupiedSpots || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Free</span>
                <Badge variant={freeSpots > 0 ? "default" : "secondary"}>{freeSpots}</Badge>
              </div>

              <form onSubmit={updateCapacity} className="space-y-2 pt-2">
                <Label htmlFor="cap">Update total spots</Label>
                <div className="flex gap-2">
                  <Input id="cap" type="number" min="0" value={newTotal} onChange={(e) => setNewTotal(e.target.value)} />
                  <Button type="submit" disabled={updatingCapacity}>{updatingCapacity ? "Saving..." : "Save"}</Button>
                </div>
              </form>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={createManualSlip} disabled={freeSpots <= 0}><Plus className="h-4 w-4 mr-1"/>Add Slip</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Cars / Slips</CardTitle>
              <CardDescription>Remove a slip to free a spot</CardDescription>
            </CardHeader>
            <CardContent>
              {slips.length === 0 ? (
                <p className="text-muted-foreground">No slips yet</p>
              ) : (
                <div className="space-y-3">
                  {slips.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{s.slipNumber}</p>
                        <p className="text-xs text-muted-foreground">{s.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => deleteSlip(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
