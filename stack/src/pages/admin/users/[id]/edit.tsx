import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

const EditUser = () => {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    status: "Active",
  });

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = storedUser
          ? JSON.parse(storedUser).token
          : null;

        const response = await axiosInstance.get(
          `/user/admin/${id}`
        );

        console.log("User data:", response.data);

        const userData = response.data.data;

        setUser(userData);

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "user",
          status: userData.status || "Active",
        });

        setLoading(false);
      } catch (error) {
        console.log("Error fetching user:", error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      const storedUser = localStorage.getItem("user");
      const token = storedUser
        ? JSON.parse(storedUser).token
        : null;

      const response = await axiosInstance.patch(
        `/user/admin/${id}`,
        formData
      );

      console.log("Updated user:", response.data);

      alert("User updated successfully");

      router.push("/admin/users");
    } catch (error) {
      console.log("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading user...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>Edit User</h1>

      <p>User ID: {id}</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <br />

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <label>Phone</label>
          <br />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <label>Role</label>
          <br />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <br />

        <div>
          <label>Status</label>
          <br />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <br />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/users")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditUser;