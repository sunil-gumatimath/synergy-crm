import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Card from "./ui/Card";
import { employeeService } from "../services/employeeService";
import { supabase } from "../lib/supabase";

const REALTIME_DEBOUNCE_MS = 500;

const Stats = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const debounceRef = useRef(null);

  const fetchEmployees = useCallback(async () => {
    const { data } = await employeeService.getAll();
    if (!mountedRef.current) return;
    if (data) {
      setEmployees(data);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();

    // Real-time subscription with debounced refetch to coalesce bursts of
    // postgres_changes events (e.g. bulk edits) into a single fetch.
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
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            if (mountedRef.current) fetchEmployees();
          }, REALTIME_DEBOUNCE_MS);
        },
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
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
      { label: "Total Employees", value: totalEmployees },
      { label: "Active Now", value: activeEmployees },
      { label: "On Leave", value: onLeaveEmployees },
      { label: "Departments", value: departments },
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
          <h3 className="text-2xl font-bold text-main">{stat.value}</h3>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(Stats);
