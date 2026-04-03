import React, { useState, useEffect, useMemo, useCallback } from "react";
import Card from "./ui/Card";
import { employeeService } from "../services/employeeService";
import { supabase } from "../lib/supabase";

const Stats = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    const { data } = await employeeService.getAll();
    if (data) {
      setEmployees(data);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();

    // Real-time subscription
    const channel = supabase
      .channel("stats-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employees",
        },
        () => {
          fetchEmployees();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmployees]);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(
      (e) => e.status === "Active",
    ).length;
    const onLeaveEmployees = employees.filter(
      (e) => e.status === "On Leave",
    ).length;
    const departments = new Set(employees.map((e) => e.department)).size;

    return [
      {
        label: "Total Employees",
        value: totalEmployees,
        change: "+12%", // Placeholder for trend
        trend: "up",
      },
      {
        label: "Active Now",
        value: activeEmployees,
        change: "+5%", // Placeholder for trend
        trend: "up",
      },
      {
        label: "On Leave",
        value: onLeaveEmployees,
        change: "-2%", // Placeholder for trend
        trend: "down",
      },
      {
        label: "Departments",
        value: departments,
        change: "0%",
        trend: "neutral",
      },
    ];
  }, [employees]);

  if (isLoading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="text-muted text-sm font-medium mb-1">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-main">{stat.value}</h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend === "up"
                ? "status-active"
                : stat.trend === "down"
                  ? "status-leave"
                  : "status-offline"
                }`}
            >
              {stat.change}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(Stats);
