import React from "react";
import { CheckCircle } from "../lib/icons";

const ProfileCompletionBar = ({ profile }) => {
  const checks = [
    {
      key: "fullName",
      label: "Full name",
      complete: profile.fullName?.length > 0,
    },
    { key: "email", label: "Email", complete: profile.email?.length > 0 },
    {
      key: "phone",
      label: "Phone number",
      complete: profile.phone?.length > 0,
    },
    { key: "bio", label: "Bio", complete: profile.bio?.length > 20 },
    { key: "avatar", label: "Profile photo", complete: true },
  ];

  const completedCount = checks.filter((check) => check.complete).length;
  const percentage = (completedCount / checks.length) * 100;
  const missingItems = checks.filter((check) => !check.complete);

  if (percentage === 100) {
    return (
      <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-none p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-none">
            <CheckCircle className="text-emerald-600" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">
              Profile complete!
            </h4>
            <p className="text-sm text-emerald-700 mt-0.5">
              Your profile is 100% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-none p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-indigo-900">
            Profile {Math.round(percentage)}% complete
          </h4>
          <p className="text-sm text-indigo-700 mt-0.5">
            {missingItems.length === 1
              ? `Add your ${missingItems[0].label.toLowerCase()} to complete your profile`
              : `Complete ${missingItems.length} more items`}
          </p>
        </div>
        <span className="text-lg font-bold text-indigo-600">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="relative h-2 bg-indigo-100 rounded-none overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-none transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProfileCompletionBar;
