import React from "react";
import { BkashIcon, NagadIcon, RocketIcon, CardIcon, CryptoIcon } from "./icons/PaymentIcons";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: "bkash", name: "bKash", icon: BkashIcon, description: "Pay with bKash" },
  { id: "nagad", name: "Nagad", icon: NagadIcon, description: "Pay with Nagad" },
  { id: "rocket", name: "Rocket", icon: RocketIcon, description: "Pay with Rocket" },
  { id: "card", name: "Card", icon: CardIcon, description: "Visa/Mastercard" },
  { id: "crypto", name: "Crypto", icon: CryptoIcon, description: "BTC/ETH/USDT" },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onSelect: (method: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      <label className="tipkoro-label">Select Payment Method</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={`payment-method-card flex-col items-center text-center ${
                isSelected ? "selected" : ""
              }`}
              aria-pressed={isSelected}
              aria-label={`Pay with ${method.name}`}
            >
              <Icon className="w-10 h-10" />
              <span className="font-semibold text-sm">{method.name}</span>
              <span className="text-xs text-muted-foreground">{method.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
