import React from "react";
import { Check, X } from "../lib/icons";

const PasswordStrengthIndicator = ({ password }) => {
  const checks = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "Contains uppercase letter", test: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", test: /[a-z]/.test(password) },
    { label: "Contains number", test: /[0-9]/.test(password) },
    {
      label: "Contains special character",
      test: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passedChecks = checks.filter((check) => check.test).length;
  const strength =
    passedChecks <= 2 ? "weak" : passedChecks <= 3 ? "medium" : "strong";

  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-amber-500",
    strong: "bg-emerald-500",
  };

  const strengthLabels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  const strengthTextColors = {
    weak: "text-red-700",
    medium: "text-amber-700",
    strong: "text-emerald-700",
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Password strength
          </span>
          <span
            className={`text-xs font-bold uppercase ${strengthTextColors[strength]}`}
          >
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={`flex-1 rounded-none transition-all duration-300 ${
                bar <= passedChecks ? strengthColors[strength] : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5 bg-slate-50 rounded-none p-3 border border-slate-200">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className={`shrink-0 ${check.test ? "text-emerald-600" : "text-slate-400"}`}
            >
              {check.test ? <Check size={14} /> : <X size={14} />}
            </div>
            <span className={check.test ? "text-slate-700" : "text-slate-500"}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
