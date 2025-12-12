import React, { useState } from "react";
import { Button } from "./ui/button";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

const categories = [
  "Content Creator",
  "Artist",
  "Musician",
  "Writer",
  "Educator",
  "Developer",
  "Podcaster",
  "Gamer",
  "Other",
];

const payoutMethods = [
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "rocket", label: "Rocket" },
  { id: "card", label: "Bank Card" },
  { id: "crypto", label: "Crypto (USDT)" },
];

interface SignupFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  step: "payment" | "details";
  onPaymentComplete: () => void;
}

interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  category: string;
  twitter: string;
  instagram: string;
  youtube: string;
  otherLink: string;
  payoutMethod: string;
  phone: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  isLoading = false,
  step,
  onPaymentComplete,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    category: "",
    twitter: "",
    instagram: "",
    youtube: "",
    otherLink: "",
    payoutMethod: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    if (!selectedPaymentMethod) {
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Only letters, numbers, and underscores allowed";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (formData.bio.length > 200) {
      newErrors.bio = "Bio must be under 200 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.payoutMethod) {
      newErrors.payoutMethod = "Please select a payout method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      // Simulate payment processing
      onPaymentComplete();
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      onSubmit(formData);
    }
  };

  if (step === "payment") {
    return (
      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethod}
          onSelect={setSelectedPaymentMethod}
        />

        {selectedPaymentMethod && (
          <div className="tipkoro-card bg-secondary/30 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-2">
              You&apos;ll be redirected to complete payment via{" "}
              <span className="font-semibold capitalize">{selectedPaymentMethod}</span>
            </p>
            <p className="text-2xl font-bold text-foreground">
              ৳150 <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="hero-accent"
          className="w-full"
          disabled={!selectedPaymentMethod || isLoading}
        >
          {isLoading ? "Processing..." : "Pay & Continue →"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment powered by Rupantor Pay
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-5">
      {/* Username */}
      <div>
        <label htmlFor="username" className="tipkoro-label">
          Username <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center">
          <span className="px-3 py-3 bg-muted rounded-l-xl border border-r-0 border-border text-muted-foreground text-sm">
            tipkoro.com/
          </span>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="tipkoro-input rounded-l-none"
            placeholder="yourname"
            aria-describedby={errors.username ? "username-error" : undefined}
          />
        </div>
        {errors.username && (
          <p id="username-error" className="text-sm text-destructive mt-1">
            {errors.username}
          </p>
        )}
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="tipkoro-label">
            First Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="tipkoro-input"
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="tipkoro-label">
            Last Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="tipkoro-input"
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="tipkoro-label">
          Email <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="tipkoro-input"
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="tipkoro-label">
          Short Bio <span className="text-destructive">*</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="tipkoro-input min-h-[80px] resize-none"
          placeholder="Tell your supporters what you create..."
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.bio.length}/200 characters
        </p>
        {errors.bio && (
          <p className="text-sm text-destructive mt-1">{errors.bio}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="tipkoro-label">
          Category <span className="text-destructive">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="tipkoro-input"
        >
          <option value="">Select your category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-destructive mt-1">{errors.category}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <label className="tipkoro-label">Social Links (Optional)</label>
        <input
          type="url"
          name="twitter"
          value={formData.twitter}
          onChange={handleInputChange}
          className="tipkoro-input"
          placeholder="Twitter/X URL"
        />
        <input
          type="url"
          name="instagram"
          value={formData.instagram}
          onChange={handleInputChange}
          className="tipkoro-input"
          placeholder="Instagram URL"
        />
        <input
          type="url"
          name="youtube"
          value={formData.youtube}
          onChange={handleInputChange}
          className="tipkoro-input"
          placeholder="YouTube URL"
        />
        <input
          type="url"
          name="otherLink"
          value={formData.otherLink}
          onChange={handleInputChange}
          className="tipkoro-input"
          placeholder="Other link"
        />
      </div>

      {/* Payout Method */}
      <div>
        <label htmlFor="payoutMethod" className="tipkoro-label">
          Preferred Payout Method <span className="text-destructive">*</span>
        </label>
        <select
          id="payoutMethod"
          name="payoutMethod"
          value={formData.payoutMethod}
          onChange={handleInputChange}
          className="tipkoro-input"
        >
          <option value="">Select payout method</option>
          {payoutMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.label}
            </option>
          ))}
        </select>
        {errors.payoutMethod && (
          <p className="text-sm text-destructive mt-1">{errors.payoutMethod}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="tipkoro-label">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="tipkoro-input"
          placeholder="+880 1XXX-XXXXXX"
        />
      </div>

      <Button
        type="submit"
        variant="hero-accent"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Complete Signup ✓"}
      </Button>
    </form>
  );
};
