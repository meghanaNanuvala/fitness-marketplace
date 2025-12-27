import { useEffect, useState, useCallback } from "react";
import { fetchAllListings } from "../../lib/api";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

// Fetch Users
const fetchAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch users");
  }
  return response.json();
};

// Correct Status Update API
const updateUserStatus = async (userId: string | number, newStatus: string) => {
  const response = await fetch(`${API_BASE_URL}/users/update_status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      new_status: newStatus,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update status");
  }
  return true;
};

// Status Action Button
function UserAction({
  userId,
  username,
  status,
  onStatusChange,
  disabled,
}: {
  userId: string | number;
  username: string;
  status: string;
  disabled: boolean;
  onStatusChange: (
    userId: string | number,
    newStatus: string,
    type: "success" | "error",
    message: string
  ) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const isInactive = status === "Inactive";
  const targetStatus = isInactive ? "Active" : "Inactive";

  const handleClick = async () => {
    if (processing || disabled) return;
    setProcessing(true);
    try {
      await updateUserStatus(userId, targetStatus);
      onStatusChange(
        userId,
        targetStatus,
        "success",
        `User '${username}' ${targetStatus === "Active" ? "activated" : "deactivated"} successfully`
      );
    } catch (err: any) {
      onStatusChange(userId, status, "error", err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      disabled={processing || disabled}
      onClick={handleClick}
      className={`px-4 py-2 rounded text-white font-semibold ${
        targetStatus === "Active"
          ? "bg-green-600 hover:bg-green-700"
          : "bg-red-600 hover:bg-red-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {processing ? "Processing..." : targetStatus === "Active" ? "Activate User" : "Deactivate User"}
    </button>
  );
}

export default function AdminPage() {
  const [totalItems, setTotalItems] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const usersResponse = await fetchAllUsers();
      const listings = await fetchAllListings();

      const usersWithListings = usersResponse.map((u: any) => ({
        ...u,
        listings: listings.filter(
          (l: any) => String(l.ownerUserId) === String(u.userId || u.id)
        ).length,
      }));

      setUsers(usersWithListings);
      setTotalItems(listings.length);
      setRevenue(
        listings.reduce(
          (sum: number, l: any) => sum + (parseInt(l.priceCents) || 0),
          0
        ) / 100
      );
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = (
    userId: string | number,
    newStatus: string,
    type: "success" | "error",
    msg: string
  ) => {
    setMessage({ type, text: msg });

    if (type === "success") {
      setUsers((prev) =>
        prev.map((user) =>
          user.userId === userId || user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
    }

    setProcessingUserId(null);
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-2">Admin Dashboard</h1>

      {message && (
        <div
          className={`p-3 rounded mb-4 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* TOP STATS — unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 p-6 rounded border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-indigo-700">Total Active Listings</p>
          <p className="text-5xl font-bold mt-1">{totalItems}</p>
        </div>

        <div className="bg-purple-50 p-6 rounded border-l-4 border-purple-500">
          <p className="text-sm font-medium text-purple-700">Total Users</p>
          <p className="text-5xl font-bold mt-1">{users.length}</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-yellow-700">Total Revenue</p>
          <p className="text-5xl font-bold mt-1">
            {revenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">User Management</h2>

      <table className="w-full shadow-md border rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Listings</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u.userId || u.id} className="border-t">
              <td className="px-4 py-2">{u.username}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.listings}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    u.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <UserAction
                  userId={u.userId || u.id}
                  username={u.username}
                  status={u.status}
                  disabled={
                    processingUserId !== null &&
                    processingUserId !== (u.userId || u.id)
                  }
                  onStatusChange={(id, newStatus, type, msg) =>
                    handleStatusChange(id, newStatus, type, msg)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
