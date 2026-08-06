"use client";

import { useState, useEffect } from 'react';
import {getUsers , deactivateUser , updateUser} from "@/src/utils/api";
import { useAuthContext } from '@/src/context/AuthContext';
import { Pencil, Trash2 } from "lucide-react";
import React from 'react';

const Users = () => {
    
    const { user } = useAuthContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [editingUser, setEditingUser] = useState(null);

      const [editForm, setEditForm] = useState({
       name: "",
       email: "",
       isEmailVerified: false,
      });

    useEffect(() => {
     fetchUsers();
       }, []);

    const fetchUsers = async () => {
     try {
    const data = await getUsers();
    console.log(data);
    setUsers(data);
    } catch (err) {
    setError(err.message);
    } finally {
    setLoading(false);
    }
   }; 
     
    const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
    "Are you sure you want to delete this user?"
  );

  if (!confirmDelete) return;

  try {
    await deactivateUser(id);

    // Refresh the table
    fetchUsers();

  } catch (err) {
    alert(err.message);
  }
};

  const handleEdit = (targetUser) => {
  setEditingUser(targetUser);

  setEditForm({
    name: targetUser.name,
    email: targetUser.email,
    isEmailVerified: targetUser.isEmailVerified,
  });
};

  const handleSave = async () => {
  try {
    await updateUser(editingUser._id, editForm);

    setEditingUser(null);

    fetchUsers();

  } catch (err) {
    alert(err.message);
  }
};


   if (loading) {
    return <p>Loading users...</p>;
   }

   if (error) {
  return <p>{error}</p>;
   }


  return (
  <div className="overflow-x-auto">
    <h1 className="text-2xl font-bold mb-6">
      Users
    </h1>

    {editingUser && (
  <div className="mb-6 border rounded p-4">
    <h2 className="text-lg font-semibold mb-4">
      Edit User
    </h2>

    <input
      type="text"
      value={editForm.name}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          name: e.target.value,
        })
      }
      className="border p-2 mr-2"
      placeholder="Name"
    />

    <input
      type="email"
      value={editForm.email}
      onChange={(e) =>
        setEditForm({
          ...editForm,
          email: e.target.value,
        })
      }
      className="border p-2 mr-2"
      placeholder="Email"
    />

    <label className="mr-4">
      <input
        type="checkbox"
        checked={editForm.isEmailVerified}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            isEmailVerified: e.target.checked,
          })
        }
      />
      Verified
    </label>

    <button
      onClick={handleSave}
      className="bg-green-500 text-white px-4 py-2 rounded mr-2"
    >
      Save
    </button>

    <button
      onClick={() => setEditingUser(null)}
      className="bg-gray-500 text-white px-4 py-2 rounded"
    >
      Cancel
    </button>
  </div>
)}
  <table className="min-w-full border border-gray-300 rounded-lg">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-6 py-3 text-left">Name</th>
        <th className="px-6 py-3 text-left">Email</th>
        <th className="px-6 py-3 text-left">Role</th>
        <th className="px-6 py-3 text-center">Verified</th>
        <th className="px-6 py-3 text-center">Actions</th>
      </tr>
    </thead>

    <tbody>
  {users.map((targetUser) => (
    <tr
      key={targetUser._id}
      className="border-t hover:bg-gray-50 transition"
    >
      <td className="px-6 py-4">{targetUser.name}</td>

      <td className="px-6 py-4">{targetUser.email}</td>

      <td className="px-6 py-4 capitalize">
        {targetUser.role}
      </td>

      <td className="px-6 py-4 text-center">
        {targetUser.isEmailVerified ? "Yes" : "No"}
      </td>

      <td className="px-6 py-4">
        {(
          (user?.role === "admin" &&
            user._id !== targetUser._id) ||

          (user?.role === "teacher" &&
            targetUser.role === "student")
        ) && (
          <div className="flex justify-center items-center gap-3">

            <button
              onClick={() => handleEdit(targetUser)}
              className="rounded-full p-2 text-blue-600 hover:bg-blue-100 transition"
              title="Edit"
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={() => handleDelete(targetUser._id)}
              className="rounded-full p-2 text-red-600 hover:bg-red-100 transition"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>

          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
  </table>
</div>
);
}

export default Users
