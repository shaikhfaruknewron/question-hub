"use client";

import { useState, useEffect } from 'react';
import {getUsers , deactivateUser , updateUser,addUser} from "@/src/utils/api";
import { useAuthContext } from '@/src/context/AuthContext';
import { Pencil, Trash2 } from "lucide-react";
import React from 'react';

const Users = () => {
    
    const { user } = useAuthContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

     const [currentPage, setCurrentPage] = useState(1);
     const [totalPages, setTotalPages] = useState(1);
     const [totalUsers, setTotalUsers] = useState(0);

     const [roleFilter, setRoleFilter] = useState("all");

     const USERS_PER_PAGE = 10;


    const [showAddUser, setShowAddUser] = useState(false);

    const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    });

    const [addingUser, setAddingUser] = useState(false);
    const [addUserError, setAddUserError] = useState("");
    
    const [editingUser, setEditingUser] = useState(null);

      const [editForm, setEditForm] = useState({
       name: "",
       email: "",
       isEmailVerified: false,
      });

    useEffect(() => {
     fetchUsers(currentPage);
    }, [currentPage,roleFilter]);

    const fetchUsers = async (currentPageNumber) => {
    try {
    setLoading(true);
    setError("");

    const data = await getUsers(currentPageNumber,roleFilter);

    console.log("CURRENT PAGE:", currentPageNumber);
    console.log("ROLE FILTER:", roleFilter);
    console.log("USERS:", data.users);

    setUsers(data.users);
    setTotalPages(data.pagination.totalPages);
    setTotalUsers(data.pagination.totalUsers);

    } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch users"
    );
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
    fetchUsers(currentPage);

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

    fetchUsers(currentPage);

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

   const handleAddUser = async (e) => {
   e.preventDefault();

  setAddUserError("");

  if (!newUser.name || !newUser.email || !newUser.role) {
    setAddUserError("Please fill all fields.");
    return;
  }

  try {
    setAddingUser(true);

    await addUser(newUser);

    // Refresh users list
   const data = await getUsers(currentPage, USERS_PER_PAGE);

setUsers(data.users);
setTotalPages(data.pagination.totalPages);
setTotalUsers(data.pagination.totalUsers);

    // Reset form
    setNewUser({
      name: "",
      email: "",
      role: "student",
    });

    setShowAddUser(false);

  } catch (err) {
    setAddUserError(
      err.response?.data?.message ||
      err.message ||
      "Failed to create user"
    );
  } finally {
    setAddingUser(false);
  }
};


  return (
  <div className="p-6 bg-gray-50 min-h-screen">
   <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">
    Users
  </h1>
  
  <div className="flex items-center gap-3">
    {/* Role Filter */}
    <select
      value={roleFilter}
      onChange={(e) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1);
      }}
      className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
    >
      <option value="all">All Users</option>
      <option value="student">Students</option>
      <option value="teacher">Teachers</option>
      <option value="admin">Admins</option>
    </select>

  {(user?.role === "admin" || user?.role === "teacher") && (
    <button
      onClick={() => setShowAddUser(true)}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
    >
      + Add User
    </button>
  )}
</div>
</div>

    {showAddUser && (
  <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">

    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold">
        Add User
      </h2>

      <button
        type="button"
        onClick={() => setShowAddUser(false)}
        className="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>

    {addUserError && (
      <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
        {addUserError}
      </div>
    )}

    <form onSubmit={handleAddUser}>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Name
          </label>

          <input
            type="text"
            value={newUser.name}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                name: e.target.value,
              })
            }
            placeholder="Enter name"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>

          <input
            type="email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                email: e.target.value,
              })
            }
            placeholder="Enter email"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Role
          </label>

          {user?.role === "admin" ? (
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value,
                })
              }
              className="w-full rounded-lg border px-4 py-2"
            >
              <option value="student">
                Student
              </option>

              <option value="teacher">
                Teacher
              </option>
            </select>
          ) : (
            <input
              type="text"
              value="Student"
              disabled
              className="w-full rounded-lg border bg-gray-100 px-4 py-2"
            />
          )}
        </div>

      </div>

      <div className="mt-5 flex justify-end gap-3">

        <button
          type="button"
          onClick={() => setShowAddUser(false)}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={addingUser}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {addingUser ? "Creating..." : "Create User"}
        </button>

      </div>

    </form>
  </div>
)}

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
      <td className="px-6 py-4">
        {targetUser.name}
      </td>

      <td className="px-6 py-4">
        {targetUser.email}
      </td>

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
  <div className="flex items-center justify-between mt-6">

  <p className="text-sm text-gray-600">
    Page {currentPage} of {totalPages} • {totalUsers} users
  </p>

  <div className="flex gap-2">

    <button
      onClick={() => setCurrentPage((prev) => prev - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 border rounded-lg disabled:opacity-50"
    >
      Previous
    </button>

    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    ).map((pageNumber) => (
      <button
        key={pageNumber}
        onClick={() => setCurrentPage(pageNumber)}
        className={`px-3 py-2 rounded-lg ${
          currentPage === pageNumber
            ? "bg-blue-600 text-white"
            : "border"
        }`}
      >
        {pageNumber}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((prev) => prev + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 border rounded-lg disabled:opacity-50"
    >
      Next
    </button>

  </div>
</div>
</div>
);
}

export default Users
