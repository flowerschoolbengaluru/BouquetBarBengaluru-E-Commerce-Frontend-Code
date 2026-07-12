import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Clock, Zap, AlertCircle, CalendarDays } from "lucide-react";
import { useCart } from "@/hooks/cart-context";
import type { DeliveryOption as BaseDeliveryOption } from "@shared/schema";

interface DeliveryOption extends BaseDeliveryOption {
  description: string;
  // Real delivery_options.id to submit to the backend when this option's own
  // id is a UI-only sentinel (e.g. FUTURE_DATE_OPTION_ID) with no DB row.
  backendOptionId?: string;
}

const FUTURE_DATE_OPTION_ID = "future-date";

const getTodayIso = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface DeliveryOptionsProps {
  pincodeDistance?: number;
  className?: string;
}

export default function DeliveryOptions({ pincodeDistance, className }: DeliveryOptionsProps) {
  const { 
    deliveryOption,
    setDeliveryOption,
    loadDeliveryOptions
  } = useCart();
  
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [selectedFutureDate, setSelectedFutureDate] = useState<string>(getTodayIso());
  const futureDateInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load delivery options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedOptions = await loadDeliveryOptions();
        // Transform the data to include descriptions
        const transformedOptions: DeliveryOption[] = fetchedOptions.map(option => ({
          ...option,
          description: `${option.name} delivery within ${option.estimatedDays}`
        }));
        setOptions(transformedOptions);
      } catch (err) {
        console.error("Error loading delivery options:", err);
        setError("Failed to load delivery options. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [loadDeliveryOptions]);

  // Filter delivery options based on pincode distance
  // Only expose three options in the UI: Next Day, Same Day, Select Future Date
  const availableOptions = useMemo(() => {
    // Normalize server-provided options to canonical Next/Same names
    const lower = (s: string) => s.toLowerCase();
    const nextDay = options.find(o => lower(o.name).includes('next'));
    const sameDay = options.find(o => lower(o.name).includes('same'));

    const ordered: DeliveryOption[] = [];
    if (nextDay) ordered.push({ ...nextDay, name: 'Next Day Delivery' } as DeliveryOption);
    if (sameDay) ordered.push({ ...sameDay, name: 'Same Day Delivery' } as DeliveryOption);

    // Ensure both are present (fallback to server options if missing)
    if (!nextDay && options.length > 0) {
      const pick = options.find(o => !ordered.some(x => x.id === o.id));
      if (pick) ordered.push({ ...pick, name: 'Next Day Delivery' } as DeliveryOption);
    }

    // "Select Future Date" is a UI-only choice — it has no row of its own in
    // delivery_options, so the backend would reject FUTURE_DATE_OPTION_ID as
    // an invalid delivery option. Piggyback it on a real option's id/price
    // (via backendOptionId) so order placement always submits a genuine,
    // valid delivery_options id, while keeping a distinct id for the radio
    // group/UI selection logic.
    const backingOption = nextDay || sameDay || options[0];
    if (backingOption) {
      const futureDateOption: DeliveryOption = {
        ...backingOption,
        id: FUTURE_DATE_OPTION_ID,
        name: "Select Future Date",
        description: "Choose a future delivery date from the calendar",
        backendOptionId: backingOption.id,
      } as DeliveryOption;
      ordered.push(futureDateOption);
    }

    return ordered;
  }, [options]);

  // Auto-select the best option based on distance when options change
  useEffect(() => {
    if (availableOptions.length > 0) {
      // If current selection is still valid, keep it
      const isCurrentOptionAvailable = availableOptions.some(
        opt => opt.id === deliveryOption?.id
      );

      if (isCurrentOptionAvailable && deliveryOption) {
        return;
      }

      // Prefer Same Day/Express under 10km, otherwise prefer Next Day delivery
      const pickPreferred = () => {
        const lower = (s: string) => s.toLowerCase();
        const byName = (substrs: string[]) => availableOptions.find(opt => substrs.some(s => lower(opt.name).includes(s)));

        if (pincodeDistance !== undefined && pincodeDistance < 10) {
          // Try to pick Same Day first
          return byName(["same day", "express"]) || availableOptions[0];
        }
        // 10km and above: prefer Next Day delivery
        return byName(["next day", "next-day", "tomorrow"]) || byName(["standard", "regular"]) || availableOptions[0];
      };

      const preferred = pickPreferred();
      setDeliveryOption(preferred);
    } else if (deliveryOption && pincodeDistance !== undefined) {
      // Clear selection if no options are available and we have distance info
      setDeliveryOption(null);
    }
  }, [availableOptions, deliveryOption?.id, setDeliveryOption, pincodeDistance]);

  // Format price in INR currency
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  // Get icon for delivery option based on name
  const getDeliveryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('same') || lowerName.includes('express')) {
      return <Zap className="h-5 w-5" />;
    } else if (lowerName.includes('standard') || lowerName.includes('regular')) {
      return <Truck className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5" />;
  };

  // Handle delivery option selection (auto-focus calendar when future date chosen)
  const handleOptionChange = (optionId: string) => {
    const selectedOption = availableOptions.find(opt => opt.id === optionId);
    if (selectedOption) {
      if (selectedOption.id === FUTURE_DATE_OPTION_ID) {
        setDeliveryOption({
          ...selectedOption,
          name: `Future Date Delivery (${selectedFutureDate})`,
          description: `Delivery on ${selectedFutureDate}`,
        });

        // Focus calendar input after render
        setTimeout(() => {
          futureDateInputRef.current?.focus();
        }, 0);
      } else {
        setDeliveryOption(selectedOption);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className={className} data-testid="card-delivery-options-loading">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} data-testid="card-delivery-options-error">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Delivery Optionsyu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (availableOptions.length === 0) {
    return (
      <Card className={className} data-testid="card-delivery-options-empty">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {pincodeDistance !== undefined 
                ? "No delivery options available for your location. Please select a different address."
                : "Please select a delivery address to see available delivery options."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="card-delivery-options">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="mr-2 h-5 w-5" />
          Delivery Options
        </CardTitle>
        {pincodeDistance !== undefined && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">
                  Delivery Distance: {pincodeDistance}km from our location
                </p>
                <p className="mt-1">
                  {pincodeDistance < 10 
                    ? "✓ Same Day delivery available for your location (distance under 10km)"
                    : "📅 Next Day delivery recommended for your location (distance 10km or above)"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={deliveryOption?.id || ""}
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {availableOptions.map((option) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={option.id} 
                  id={`delivery-${option.id}`}
                  data-testid={`radio-delivery-${option.id}`}
                />
                <Label 
                  htmlFor={`delivery-${option.id}`}
                  className="flex-1 flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  data-testid={`label-delivery-${option.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">
                      {option.id === FUTURE_DATE_OPTION_ID ? <CalendarDays className="h-5 w-5" /> : getDeliveryIcon(option.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">
                        {option.name}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
              {deliveryOption?.id === FUTURE_DATE_OPTION_ID && option.id === FUTURE_DATE_OPTION_ID && (
                <div className="pl-11 pr-3">
                  <Label htmlFor="future-delivery-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Select delivery date
                  </Label>
                  <input
                    id="future-delivery-date"
                    ref={futureDateInputRef}
                    type="date"
                    value={selectedFutureDate}
                    min={getTodayIso()}
                    onChange={(e) => {
                      setSelectedFutureDate(e.target.value);
                      if (deliveryOption?.id === FUTURE_DATE_OPTION_ID) {
                        setDeliveryOption({
                          ...option,
                          name: `Future Date Delivery (${e.target.value})`,
                          description: `Delivery on ${e.target.value}`,
                        });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                    data-testid="input-future-delivery-date"
                  />
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <div className="px-6 pb-4">
        <p className="text-sm text-green-600">
          <strong>Note:</strong> Delivery charges will vary depending on the porter or third-party delivery services.
        </p>
      </div>
    </Card>
  );
}
