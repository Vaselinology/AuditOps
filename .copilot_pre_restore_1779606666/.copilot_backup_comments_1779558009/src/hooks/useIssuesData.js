import { useState, useEffect } from "react";

export function useIssuesData() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const d = await res.json();
        setIssues(d.issues);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { issues, users, fetchIssues };
}
