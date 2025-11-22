import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Edit3, Trash2, Camera, MapPin, Phone, Mail, Globe, Save, X, Settings, Shield, Heart, ShoppingBag, HelpCircle, MessageCircle, Package, Calendar, Truck, Plus, Edit, Home, Building2, Star } from "lucide-react";
import { Link } from "wouter";

// Allowed pin codes for Bangalore
const ALLOWED_PIN_CODES = [
  "560034", "560095", "560030", "560047", "560068", "560076",
  "560102", "560011", "560041", "560069", "560027", "560025",
  "560038", "560071", "560001", "560008", "560005", "560004",
  "560006", "560003", "560066", "560037", "560100", "560064",
  "560072", "560024"
];

// Address form schema with stricter validation
const addressFormSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email"),
  addressline1: z.string().min(1, "Address line 1 is required"),
  addressline2: z.string().min(1, "Address line 2 is required"),
  landmark: z.string().min(1, "Landmark is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalcode: z.string()
    .min(6, "Postal code must be 6 digits")
    .max(6, "Postal code must be 6 digits")
    .refine((code) => ALLOWED_PIN_CODES.includes(code), {
      message: "This postal code is not in our delivery area"
    }),
  country: z.string().default("India"),
  addresstype: z.enum(["Home", "Office", "Other"]).default("Home"),
  isdefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressData {
  id?: string;
  userid?: string;
  fullname: string;
  phone: string;
  email?: string;
  addressline1: string;
  addressline2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalcode: string;
  country: string;
  addresstype: "Home" | "Office" | "Other";
  isdefault: boolean;
  createdat?: string;
  updatedat?: string;
  isactive?: boolean;
}

// Address Form Component - Made responsive
function AddressForm({ address, onSuccess }: { address?: AddressData; onSuccess: () => void }) {
  const { toast } = useToast();

  const getDefaultValues = () => ({
    fullname: address?.fullname || "",
    phone: address?.phone || "",
    email: address?.email || "",
    addressline1: address?.addressline1 || "",
    addressline2: address?.addressline2 || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    postalcode: address?.postalcode || "",
    country: address?.country || "India",
    addresstype: (address?.addresstype as "Home" | "Office" | "Other") || "Home",
    isdefault: address?.isdefault || false,
  });

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const defaultValues = getDefaultValues();
    form.reset(defaultValues);
  }, [address?.id, form]);

  const saveAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const isEdit = address?.id;
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `/api/addresses/${address.id}` : "/api/addresses"

      const requestData = {
        fullName: data.fullname,
        phone: data.phone,
        email: data.email,
        addressLine1: data.addressline1,
        addressLine2: data.addressline2,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        postalCode: data.postalcode,
        country: data.country,
        addressType: data.addresstype,
        isDefault: data.isdefault,
      };

      const response = await apiRequest(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = { success: true };
      }
      return result;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Success",
        description: `Address ${address?.id ? 'updated' : 'added'} successfully`,
      });
      form.reset(getDefaultValues());
      onSuccess();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to save address";
      if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiRequest(`/api/addresses/${addressId}/set-default`, {
        method: "PUT",
      });

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`Failed to set default: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Default Address Set",
        description: "This address has been set as your default address",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set default address",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddressFormData) => {
    saveAddressMutation.mutate(data);
  };

  const handleSetDefault = () => {
    if (address?.id) {
      setDefaultMutation.mutate(address.id);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-h-[80vh] overflow-y-auto px-1">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="fullname" className="text-sm">Full Name *</Label>
            <Input
              id="fullname"
              {...form.register("fullname")}
              placeholder="Enter full name"
              className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
            />
            {form.formState.errors.fullname && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.fullname.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="Enter phone number"
              className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="Enter email address"
            className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="addressline1" className="text-sm">Address Line 1 *</Label>
          <Input
            id="addressline1"
            {...form.register("addressline1")}
            placeholder="House/Flat no, Building name"
            className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
          />
          {form.formState.errors.addressline1 && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.addressline1.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="addressline2" className="text-sm">Address Line 2 *</Label>
          <Input
            id="addressline2"
            {...form.register("addressline2")}
            placeholder="Area, Locality"
            className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
          />
          {form.formState.errors.addressline2 && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.addressline2.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="landmark" className="text-sm">Landmark *</Label>
          <Input
            id="landmark"
            {...form.register("landmark")}
            placeholder="Nearby landmark"
            className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
          />
          {form.formState.errors.landmark && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.landmark.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="city" className="text-sm">City *</Label>
            <Input
              id="city"
              {...form.register("city")}
              placeholder="City"
              className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
            />
            {form.formState.errors.city && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state" className="text-sm">State *</Label>
            <Input
              id="state"
              {...form.register("state")}
              placeholder="State"
              className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
            />
            {form.formState.errors.state && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.state.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="postalcode" className="text-sm">Postal Code *</Label>
            <Input
              id="postalcode"
              {...form.register("postalcode")}
              placeholder="Postal Code"
              maxLength={6}
              className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
            />
            {form.formState.errors.postalcode && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.postalcode.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="country" className="text-sm">Country *</Label>
            <Input
              id="country"
              {...form.register("country")}
              placeholder="Country"
              className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"
            />
            {form.formState.errors.country && (
              <p className="text-xs text-red-600 mt-1">{form.formState.errors.country.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm">Address Type</Label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
            {(["Home", "Office", "Other"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  {...form.register("addresstype")}
                  className="text-pink-600 focus:ring-pink-500"
                />
                <div className="flex items-center gap-1">
                  {type === "Home" && <Home className="h-4 w-4" />}
                  {type === "Office" && <Building2 className="h-4 w-4" />}
                  {type === "Other" && <MapPin className="h-4 w-4" />}
                  <span className="text-sm">{type}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...form.register("isdefault")}
            className="text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm">Make this my default address</span>
        </label>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={saveAddressMutation.isPending}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-sm sm:text-base"
          >
            {saveAddressMutation.isPending ? "Saving..." : address?.id ? "Update Address" : "Save Address"}
          </Button>
        </div>
      </form>

      {address?.id && !address.isdefault && (
        <div className="pt-2 border-t">
          <Button
            onClick={handleSetDefault}
            disabled={setDefaultMutation.isPending}
            variant="outline"
            className="w-full text-pink-600 border-pink-600 hover:bg-pink-50 text-sm sm:text-base"
          >
            <Star className="h-4 w-4 mr-2" />
            {setDefaultMutation.isPending ? "Setting Default..." : "Set as Default Address"}
          </Button>
        </div>
      )}
    </div>
  );
}

// Address List Component - Made responsive
function AddressList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editDialogKey, setEditDialogKey] = useState(0);

  const { data: addresses = [], isLoading, error, refetch } = useQuery<AddressData[]>({
    queryKey: ["/api/addresses"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/addresses");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        return [];
      }
    },
    retry: 2,
    staleTime: 0,
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiRequest(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      refetch();
      toast({
        title: "Address deleted",
        description: "Address has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiRequest(`/api/addresses/${addressId}/set-default`, {
        method: "PUT",
      });
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`Failed to set default: ${response.status} - ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "Default Address Set",
        description: "This address has been set as your default address",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set default address",
        variant: "destructive",
      });
    },
  });

  const handleEditAddress = (address: AddressData) => {
    const addressCopy = {
      id: address.id,
      userid: address.userid,
      fullname: address.fullname || "",
      phone: address.phone || "",
      email: address.email || "",
      addressline1: address.addressline1 || "",
      addressline2: address.addressline2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalcode: address.postalcode || "",
      country: address.country || "India",
      addresstype: address.addresstype || "Home",
      isdefault: address.isdefault || false,
      createdat: address.createdat,
      updatedat: address.updatedat,
      isactive: address.isactive,
    };

    setEditingAddress(addressCopy);
    setEditDialogKey(prev => prev + 1);
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingAddress(null);
    refetch();
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      setShowEditDialog(false);
      setEditingAddress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-5">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-16 sm:h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <MapPin className="h-8 sm:h-12 w-8 sm:w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">Add your first address to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {addresses.map((address) => (
        <Card key={address.id} className={`${address.isdefault ? 'ring-2 ring-pink-500 bg-pink-50/30 border-pink-200' : 'hover:shadow-md border-gray-200'} transition-all duration-200`}>
          <CardContent className="p-3 sm:p-5">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-3 lg:gap-4">
              <div className="flex-1 min-w-0 w-full lg:w-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {address.addresstype === "Home" && <Home className="h-4 w-4 text-green-600" />}
                    {address.addresstype === "Office" && <Building2 className="h-4 w-4 text-blue-600" />}
                    {address.addresstype === "Other" && <MapPin className="h-4 w-4 text-purple-600" />}
                    <span className="font-medium text-gray-700 text-sm sm:text-base">{address.addresstype}</span>
                  </div>
                  {address.isdefault && (
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 text-xs">
                      <Star className="h-3 w-3 mr-1 fill-pink-600" />
                      Default
                    </Badge>
                  )}
                </div>

                {/* Contact Information */}
                <div className="mb-3">
                  <p className="font-semibold text-gray-900 text-base sm:text-lg">{address.fullname}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-pink-600" />
                      {address.phone}
                    </p>
                    {address.email && (
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-pink-600" />
                        <span className="truncate">{address.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Address */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-pink-600" />
                    Complete Address
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm text-gray-800">
                    <p><span className="font-medium text-pink-600">Address:</span> {address.addressline1}</p>
                    {address.addressline2 && (
                      <p><span className="font-medium text-pink-600">Area:</span> {address.addressline2}</p>
                    )}
                    {address.landmark && (
                      <p><span className="font-medium text-pink-600">Landmark:</span> Near {address.landmark}</p>
                    )}
                    <p><span className="font-medium text-pink-600">Location:</span> {address.city}, {address.state} - {address.postalcode}</p>
                    <p><span className="font-medium text-pink-600">Country:</span> {address.country}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-2 w-full lg:w-auto">
                {!address.isdefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (address.id) {
                        setDefaultMutation.mutate(address.id);
                      }
                    }}
                    className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 border-pink-600 text-xs sm:text-sm"
                    disabled={setDefaultMutation?.isPending}
                  >
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Set Default
                  </Button>
                )}

                <Dialog
                  open={showEditDialog && editingAddress?.id === address.id}
                  onOpenChange={handleEditDialogClose}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAddress(address)}
                      className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 border-pink-600 text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl bg-white max-h-[95vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        Edit Address - {editingAddress?.addresstype}
                      </DialogTitle>
                    </DialogHeader>
                    {editingAddress && editingAddress.id === address.id && (
                      <AddressForm
                        key={`edit-${editingAddress.id}-${editDialogKey}`}
                        address={editingAddress}
                        onSuccess={handleEditSuccess}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-600 text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[95vw] max-w-md bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600 text-sm sm:text-base">
                        Delete Address - {address.addresstype}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        Are you sure you want to delete this address? This action cannot be undone.
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs sm:text-sm">
                          <strong>{address.fullname}</strong><br />
                          {address.addressline1}, {address.city}, {address.state} - {address.postalcode}
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => address.id && deleteAddressMutation.mutate(address.id)}
                        className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                        disabled={deleteAddressMutation.isPending}
                      >
                        {deleteAddressMutation.isPending ? "Deleting..." : "Delete Address"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

interface UserProfile {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  defaultAddress: string | null;
  deliveryAddress: string | null;
  country: string | null;
  state: string | null;
  createdAt: string | null;
  updatedat: string | null;
}

interface Order {
  ordernumber: string;
  quantity: string;
  status: string;
  total: string;
  deliveryaddress: string;
  image: string;
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  createdat: string;
  subcategory: string | null;
  imagefirst: string | null;
  imagesecond: string | null;
  imagethirder: string | null;
  imagefoure: string | null;
  imagefive: string | null;
  updatedate: string;
  stockquantity: string;
}

export default function MyAccount() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedOrderForAddress, setSelectedOrderForAddress] = useState<Order | null>(null);
  const [addressChangeForm, setAddressChangeForm] = useState({ deliveryAddress: '', deliveryPhone: '' });
  const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
  const { toast } = useToast();

  // Fetch user profile
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  // Fetch user orders with improved error handling
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery<Order[]>({
    queryKey: ["/api/orders/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/orders/user");
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
      }
    },
    enabled: !!profile?.id,
    retry: 3,
    staleTime: 30000,
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/user"] });
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel order",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const canCancelOrder = (order: Order) => {
    return order.status === "pending" || order.status === "confirmed";
  };

  const canChangeAddress = (order: Order) => {
    return order.status === "pending" || order.status === "confirmed" || order.status === "processing";
  };

  // Fetch user favorites with improved error handling
  const { data: favorites = [], isLoading: favoritesLoading, error: favoritesError } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/favorites", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        return [];
      }
    },
    enabled: !!profile?.id,
    retry: 2,
    staleTime: 60000,
  });

  // Initialize form with profile data
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      country: "",
      state: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstname || "",
        lastName: profile.lastname || "",
        phone: profile.phone || "",
        country: profile.country || "",
        state: profile.state || "",
      });
    }
  }, [profile, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const apiData = {
        firstname: data.firstName,
        lastname: data.lastName,
        phone: data.phone,
        country: data.country,
        state: data.state,
        id: profile?.id,
      };

      return apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify(apiData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/profile", {
        method: "DELETE",
      });

      let result;
      if (response.ok) {
        try {
          result = await response.json();
        } catch (e) {
          result = { success: true, message: "Account deleted successfully" };
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to delete account: ${response.status} - ${errorText}`);
      }

      if (result && (result.success === true || result.message === "Account deleted successfully")) {
        return result;
      } else {
        throw new Error(result.message || result.error || 'Failed to delete account');
      }
    },
    onSuccess: (data) => {
      queryClient.clear();
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('authToken');
      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      toast({
        title: "Account Deleted",
        description: data.message || "Your account has been deleted successfully.",
        variant: "default",
      });

      window.location.replace("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest(`/api/favorites/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from Favorites",
        description: "Product removed from your favorites list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const requestBody = {
        userId: profile?.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const response = await apiRequest("/api/profile/change-password", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
        } catch (e) {
          parsedError = { message: errorData };
        }
        throw new Error(parsedError.message || 'Failed to change password');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
      setShowPasswordForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const changeAddressMutation = useMutation({
    mutationFn: async ({ orderId, deliveryAddress, deliveryPhone }: { orderId: string; deliveryAddress: string; deliveryPhone?: string }) => {
      return apiRequest(`/api/orders/${orderId}/address`, {
        method: "POST",
        body: JSON.stringify({ deliveryAddress, deliveryPhone }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/user"] });
      setSelectedOrderForAddress(null);
      toast({
        title: "Address Updated",
        description: "Your delivery address has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setShowDeleteDialog(false);
  };

  const handleAddressChange = () => {
    if (!selectedOrderForAddress) return;

    changeAddressMutation.mutate({
      orderId: selectedOrderForAddress.id || selectedOrderForAddress.ordernumber,
      deliveryAddress: addressChangeForm.deliveryAddress,
      deliveryPhone: addressChangeForm.deliveryPhone || undefined
    });
  };

  const getInitials = () => {
    if (profile?.firstname && profile?.lastname) {
      return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || "U";
  };

  const getFullName = () => {
    if (profile?.firstname && profile?.lastname) {
      return `${profile.firstname} ${profile.lastname}`;
    }
    return profile?.firstname || profile?.lastname || "User";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <User className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Unable to load profile</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Please sign in to access your account.</p>
            <Link href="/signin">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-sm sm:text-base">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-2">
            <Link href="/shop" className="text-pink-600 hover:text-pink-700 flex items-center gap-2 text-xs sm:text-sm lg:text-base">
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage your profile and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8">
              <CardHeader className="text-center pb-2 sm:pb-4 px-3 sm:px-6">
                <div className="relative mx-auto mb-2 sm:mb-3 lg:mb-4">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile?.profileImageUrl || ""} alt={getFullName()} />
                    <AvatarFallback className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 rounded-full bg-white border-2 border-pink-200 hover:border-pink-300"
                    data-testid="button-upload-photo"
                  >
                    <Camera className="h-2 w-2 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-pink-600" />
                  </Button>
                </div>
                <CardTitle className="text-sm sm:text-base lg:text-lg">{getFullName()}</CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate">{profile?.email}</CardDescription>
                <Badge variant="secondary" className="bg-green-100 text-green-700 w-fit mx-auto text-xs">
                  Active Account
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 px-2 sm:px-3 lg:px-6">
                <Button
                  variant={activeTab === "profile" ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs sm:text-sm lg:text-base py-2 px-2 sm:px-3"
                  onClick={() => setActiveTab("profile")}
                  data-testid="button-nav-account"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 lg:mr-3" />
                  <span className="hidden sm:inline">Account Details</span>
                  <span className="sm:hidden">Account</span>
                </Button>
                <Button
                  variant={activeTab === "orders" ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs sm:text-sm lg:text-base py-2 px-2 sm:px-3"
                  onClick={() => setActiveTab("orders")}
                  data-testid="button-nav-orders"
                >
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 lg:mr-3" />
                  <span className="hidden sm:inline">My Orders</span>
                  <span className="sm:hidden">Orders</span>
                </Button>
                <Button
                  variant={activeTab === "addresses" ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs sm:text-sm lg:text-base py-2 px-2 sm:px-3"
                  onClick={() => setActiveTab("addresses")}
                  data-testid="button-nav-addresses"
                >
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 lg:mr-3" />
                  <span className="hidden sm:inline">My Addresses</span>
                  <span className="sm:hidden">Addresses</span>
                </Button>
                
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs sm:text-sm lg:text-base py-2 px-2 sm:px-3"
                  onClick={() => setActiveTab("settings")}
                  data-testid="button-nav-settings"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 lg:mr-3" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </Button>
                <Separator className="my-2 sm:my-4" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 px-3 sm:px-6">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                          Personal Information
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          data-testid="button-edit-profile"
                          className="text-xs sm:text-sm text-pink-600 border-pink-600 hover:bg-pink-50"
                        >
                          <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 lg:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                          {/* First Name */}
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                            <Input
                              id="firstName"
                              {...register("firstName")}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50 text-sm" : "border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"}
                              data-testid="input-first-name"
                            />
                            {errors.firstName && (
                              <p className="text-xs text-red-600">{errors.firstName.message}</p>
                            )}
                          </div>

                          {/* Last Name */}
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                            <Input
                              id="lastName"
                              {...register("lastName")}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50 text-sm" : "border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"}
                              data-testid="input-last-name"
                            />
                            {errors.lastName && (
                              <p className="text-xs text-red-600">{errors.lastName.message}</p>
                            )}
                          </div>

                          {/* Email (Read-only) */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="email"
                                value={profile?.email || ""}
                                disabled
                                className="pl-10 bg-gray-50 text-sm"
                                data-testid="input-email"
                              />
                            </div>
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="phone"
                                {...register("phone")}
                                disabled={!isEditing}
                                className={`pl-10 text-sm ${!isEditing ? "bg-gray-50" : "border-gray-300 focus:border-pink-500 focus:ring-pink-500"}`}
                                placeholder="+91 98765 43210"
                                data-testid="input-phone"
                              />
                            </div>
                            {errors.phone && (
                              <p className="text-xs text-red-600">{errors.phone.message}</p>
                            )}
                          </div>

                          {/* Country */}
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-sm">Country *</Label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="country"
                                {...register("country")}
                                disabled={!isEditing}
                                className={`pl-10 text-sm ${!isEditing ? "bg-gray-50" : "border-gray-300 focus:border-pink-500 focus:ring-pink-500"}`}
                                placeholder="India"
                                data-testid="input-country"
                              />
                            </div>
                            {errors.country && (
                              <p className="text-xs text-red-600">{errors.country.message}</p>
                            )}
                          </div>

                          {/* State */}
                          <div className="space-y-2">
                            <Label htmlFor="state" className="text-sm">State *</Label>
                            <Input
                              id="state"
                              {...register("state")}
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50 text-sm" : "border-gray-300 focus:border-pink-500 focus:ring-pink-500 text-sm"}
                              placeholder="Karnataka"
                              data-testid="input-state"
                            />
                            {errors.state && (
                              <p className="text-xs text-red-600">{errors.state.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Form Actions */}
                        {isEditing && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4 border-t">
                            <Button
                              type="submit"
                              disabled={updateProfileMutation.isPending || !isDirty}
                              className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-sm sm:text-base"
                              data-testid="button-save-profile"
                            >
                              <Save className="h-4 w-4" />
                              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancel}
                              className="flex items-center justify-center gap-2"
                              data-testid="button-cancel-edit"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>

                  {/* Account Actions */}
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-600 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Account Actions
                      </CardTitle>
                      <CardDescription>
                        Manage your account settings and data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex items-center gap-2" data-testid="button-delete-account">
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                              disabled={deleteAccountMutation.isPending}
                            >
                              {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab - combines Security and Preferences */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>
                        Manage your password and security preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold mb-2">Password</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Last updated: {profile?.updatedat ? new Date(profile.updatedat).toLocaleDateString() : "Never"}
                          </p>

                          {!showPasswordForm ? (
                            <Button
                              variant="outline"
                              onClick={() => setShowPasswordForm(true)}
                              data-testid="button-change-password"
                            >
                              Change Password
                            </Button>
                          ) : (
                            <Form {...passwordForm}>
                              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <FormField
                                  control={passwordForm.control}
                                  name="currentPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Current Password</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="password"
                                          placeholder="Enter current password"
                                          data-testid="input-current-password"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={passwordForm.control}
                                  name="newPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>New Password</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="password"
                                          placeholder="Enter new password (min 6 characters)"
                                          data-testid="input-new-password"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={passwordForm.control}
                                  name="confirmPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Confirm New Password</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="password"
                                          placeholder="Confirm new password"
                                          data-testid="input-confirm-password"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="flex gap-2">
                                  <Button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    data-testid="button-submit-password"
                                  >
                                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowPasswordForm(false);
                                      passwordForm.reset();
                                    }}
                                    disabled={changePasswordMutation.isPending}
                                    data-testid="button-cancel-password"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          )}
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Add an extra layer of security to your account
                          </p>
                          <Button variant="outline" disabled>
                            Enable 2FA <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-4 sm:space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                        Order History
                      </CardTitle>
                      <CardDescription className="text-sm">
                        View and track your recent orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      {ordersLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-3 sm:p-4 border rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : ordersError ? (
                        <div className="text-center py-6 sm:py-8">
                          <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-red-400 mb-3 sm:mb-4" />
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Unable to load orders</h3>
                          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">There was an error loading your orders. Please try refreshing the page.</p>
                          <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="text-sm sm:text-base"
                          >
                            Refresh Page
                          </Button>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-6 sm:py-8">
                          <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Start shopping to see your orders here</p>
                          <Link href="/shop">
                            <Button className="text-sm sm:text-base">Start Shopping</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {orders.map((order) => (
                            <div key={order.ordernumber} className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow" data-testid={`order-${order.ordernumber}`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                                <div className="flex items-start gap-3">
                                  {order.image && (
                                    <img
                                      src={order.image.startsWith('data:') ? order.image : `data:image/jpeg;base64,${order.image}`}
                                      alt={order.name}
                                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-sm sm:text-base">Order #{order.ordernumber}</h3>
                                    <p className="text-xs sm:text-sm text-gray-800 font-medium">{order.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {order.createdat ? new Date(order.createdat).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant={order.status === 'delivered' ? 'default' : 'secondary'}
                                    className={`text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}`}
                                  >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                  {/* {canChangeAddress(order) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1"
                                      onClick={() => handleOpenAddressChange(order)}
                                      disabled={changeAddressMutation.isPending}
                                      data-testid={`button-change-address-${order.ordernumber}`}
                                    >
                                      <Truck className="h-3 w-3 mr-1" />
                                      <span className="hidden sm:inline">Change Address</span>
                                      <span className="sm:hidden">Address</span>
                                    </Button>
                                  )} */}
                                  {/* {canCancelOrder(order) && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                                          disabled={cancelOrderMutation.isPending}
                                          data-testid={`button-cancel-order-${order.ordernumber}`}
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Cancel
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="max-w-sm sm:max-w-md">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-base sm:text-lg">Cancel Order</AlertDialogTitle>
                                          <AlertDialogDescription className="text-sm">
                                            Are you sure you want to cancel Order #{order.ordernumber}?
                                            This action cannot be undone and you will receive a refund according to our policy.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                          <AlertDialogCancel
                                            disabled={cancelOrderMutation.isPending}
                                            data-testid={`button-keep-order-${order.ordernumber}`}
                                            className="text-sm"
                                          >
                                            Keep Order
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => cancelOrderMutation.mutate(order.id || order.ordernumber)}
                                            className="bg-red-600 hover:bg-red-700 text-white text-sm"
                                            disabled={cancelOrderMutation.isPending}
                                            data-testid={`button-confirm-cancel-${order.ordernumber}`}
                                          >
                                            {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )} */}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                  <p className="text-xs sm:text-sm font-medium">Quantity: {order.quantity}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">Total: ₹{order.total}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">Category: {order.category}</p>
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-1">
                                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{order.deliveryaddress}</span>
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    Stock: {order.stockquantity} available
                                  </p>
                                </div>
                                <div className="lg:col-span-1">
                                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                    {order.description}
                                  </p>
                                  {order.updatedate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Updated: {new Date(order.updatedate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

          

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-pink-600" />
                          My Addresses
                        </CardTitle>
                        <CardDescription>
                          Manage your delivery addresses for easy checkout
                        </CardDescription>
                      </div>
                      <Dialog open={showAddAddressDialog} onOpenChange={setShowAddAddressDialog}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white">
                            <Plus className="h-4 w-4" />
                            Add Address
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-pink-600" />
                              Add New Address
                            </DialogTitle>
                          </DialogHeader>
                          <AddressForm onSuccess={() => {
                            setShowAddAddressDialog(false);
                          }} />
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      <AddressList />
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Address Change Dialog */}
      <Dialog open={!!selectedOrderForAddress} onOpenChange={() => setSelectedOrderForAddress(null)}>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Change Delivery Address</DialogTitle>
            <DialogDescription className="text-sm">
              Update the delivery address for Order #{selectedOrderForAddress?.ordernumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-medium mb-2">
                Delivery Address *
              </label>
              <textarea
                id="deliveryAddress"
                rows={3}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="Enter full delivery address"
                value={addressChangeForm.deliveryAddress}
                onChange={(e) => setAddressChangeForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                data-testid="textarea-delivery-address"
              />
            </div>
            <div>
              <label htmlFor="deliveryPhone" className="block text-sm font-medium mb-2">
                Delivery Phone (Optional)
              </label>
              <input
                type="tel"
                id="deliveryPhone"
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                placeholder="Enter phone number for delivery"
                value={addressChangeForm.deliveryPhone}
                onChange={(e) => setAddressChangeForm(prev => ({ ...prev, deliveryPhone: e.target.value }))}
                data-testid="input-delivery-phone"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedOrderForAddress(null)}
              data-testid="button-cancel-address-change"
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddressChange}
              disabled={!addressChangeForm.deliveryAddress.trim() || changeAddressMutation.isPending}
              className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto text-sm"
              data-testid="button-save-address"
            >
              {changeAddressMutation.isPending ? "Updating..." : "Update Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}