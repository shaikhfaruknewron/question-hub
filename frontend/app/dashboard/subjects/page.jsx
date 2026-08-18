"use client";

import { useEffect, useState } from "react";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deactivateSubject,
} from "@/src/utils/api";

import {useAuthContext} from "@/src/context/AuthContext";

export default function SubjectsPage() {

  const {user} = useAuthContext();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
  name: "",
  code: "",
  description: "",
});

const [isCreating, setIsCreating] = useState(false);
const [formError, setFormError] = useState("");

 const [editingSubject, setEditingSubject] = useState(null);

const [editForm, setEditForm] = useState({
  name: "",
  code: "",
  description: "",
});

const [isUpdating, setIsUpdating] = useState(false);
const [editError, setEditError] = useState("");

 const [isDeactivating, setIsDeactivating] = useState(false);

 const handleDeactivateSubject = async (subject) => {
  try {
    setIsDeactivating(true);

    const updatedSubject = await deactivateSubject(
      subject._id
    );

    setSubjects((prev) =>
      prev.map((item) =>
        item._id === updatedSubject._id
          ? updatedSubject
          : item
      )
    );

  } catch (error) {
    console.error(
      "Failed to deactivate subject:",
      error
    );

    alert(
      error?.message ||
      "Failed to deactivate subject"
    );

  } finally {
    setIsDeactivating(false);
  }
};


   const handleCreateSubject = async () => {
  try {
    setIsCreating(true);
    setFormError("");

    const newSubject = await createSubject({
      name: form.name,
      code: form.code,
      description: form.description,
    });

    setSubjects((prev) => [
      newSubject,
      ...prev,
    ]);

    setForm({
      name: "",
      code: "",
      description: "",
    });

    setShowAddForm(false);
  } catch (error) {
    console.error(
      "Failed to create subject:",
      error
    );

    setFormError(
      error?.message ||
      "Failed to create subject"
    );
  } finally {
    setIsCreating(false);
  }
};

  const handleEditClick = (subject) => {
  setEditingSubject(subject);

  setEditForm({
    name: subject.name,
    code: subject.code,
    description: subject.description || "",
  });

  setEditError("");
};

 const handleUpdateSubject = async () => {
  try {
    setIsUpdating(true);
    setEditError("");

    const updatedSubject = await updateSubject(
      editingSubject._id,
      {
        name: editForm.name,
        code: editForm.code,
        description: editForm.description,
      }
    );

    setSubjects((prev) =>
      prev.map((item) =>
        item._id === updatedSubject._id
          ? updatedSubject
          : item
      )
    );

    setEditingSubject(null);

  } catch (error) {
    console.error(
      "Failed to update subject:",
      error
    );

    setEditError(
      error?.message ||
      "Failed to update subject"
    );

  } finally {
    setIsUpdating(false);
  }
};

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSubjects();

        console.log("SUBJECTS DATA:", data);

        setSubjects(data);
      } catch (error) {
        console.error(
          "Failed to fetch subjects:",
          error
        );

        setError(
          error?.message ||
          "Failed to load subjects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading subjects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Subjects
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage subjects for Question Hub
          </p>
        </div>

{user?.role==="admin" && (
        <button
  onClick={() => {
    setShowAddForm(true);
    setFormError("");
  }}
  className="
    rounded-lg bg-blue-600 px-4 py-2
    text-sm font-medium text-white
    transition-all duration-200
    hover:bg-blue-700
    active:scale-95
  "
>
  + Add Subject
</button>
)}
      </div>

      {user?.role==="admin" && showAddForm && (
  <div className="mb-6 rounded-xl border bg-white p-6">

    <h2 className="mb-4 text-lg font-semibold">
      Add Subject
    </h2>

    {formError && (
      <p className="mb-4 text-sm text-red-500">
        {formError}
      </p>
    )}

    <div className="grid gap-4 md:grid-cols-2">

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Subject Name
        </label>

        <input
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Database Management System"
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
        />
      </div>


      {/* Code */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Subject Code
        </label>

        <input
          type="text"
          value={form.code}
          onChange={(e) =>
            setForm({
              ...form,
              code: e.target.value,
            })
          }
          placeholder="DBMS"
          className="w-full rounded-lg border px-4 py-2 uppercase outline-none focus:ring-2"
        />
      </div>

    </div>


    {/* Description */}
    <div className="mt-4">
      <label className="mb-1 block text-sm font-medium">
        Description
      </label>

      <textarea
        value={form.description}
        onChange={(e) =>
          setForm({
            ...form,
            description: e.target.value,
          })
        }
        placeholder="Database concepts and SQL"
        rows={3}
        className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
      />
    </div>


    {/* Buttons */}
    <div className="mt-5 flex gap-3">

      <button
        onClick={handleCreateSubject}
        disabled={isCreating}
        className="
          rounded-lg bg-blue-600 px-4 py-2
          text-sm font-medium text-white
          transition-all duration-200
          hover:bg-blue-700
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isCreating
          ? "Creating..."
          : "Create Subject"}
      </button>


      <button
        onClick={() => {
          setShowAddForm(false);
          setFormError("");
        }}
        disabled={isCreating}
        className="
          rounded-lg border px-4 py-2
          text-sm font-medium
          transition-all duration-200
          hover:bg-gray-100
          active:scale-95
        "
      >
        Cancel
      </button>

    </div>

  </div>
)}

    {user?.role==="admin" && editingSubject && (
  <div className="mb-6 rounded-xl border bg-white p-6">

    <h2 className="mb-4 text-lg font-semibold">
      Edit Subject
    </h2>

    {editError && (
      <p className="mb-4 text-sm text-red-500">
        {editError}
      </p>
    )}

    <div className="grid gap-4 md:grid-cols-2">

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Subject Name
        </label>

        <input
          type="text"
          value={editForm.name}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              name: e.target.value,
            })
          }
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
        />
      </div>

      {/* Code */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Subject Code
        </label>

        <input
          type="text"
          value={editForm.code}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              code: e.target.value,
            })
          }
          className="w-full rounded-lg border px-4 py-2 uppercase outline-none focus:ring-2"
        />
      </div>

    </div>

    {/* Description */}
    <div className="mt-4">
      <label className="mb-1 block text-sm font-medium">
        Description
      </label>

      <textarea
        value={editForm.description}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            description: e.target.value,
          })
        }
        rows={3}
        className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
      />
    </div>

    {/* Buttons */}
    <div className="mt-5 flex gap-3">

      <button
        onClick={handleUpdateSubject}
        disabled={isUpdating}
        className="
          rounded-lg bg-blue-600 px-4 py-2
          text-sm font-medium text-white
          transition-all duration-200
          hover:bg-blue-700
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isUpdating
          ? "Updating..."
          : "Update Subject"}
      </button>

      <button
        onClick={() => {
          setEditingSubject(null);
          setEditError("");
        }}
        disabled={isUpdating}
        className="
          rounded-lg border px-4 py-2
          text-sm font-medium
          transition-all duration-200
          hover:bg-gray-100
          active:scale-95
        "
      >
        Cancel
      </button>

    </div>

  </div>
)}


      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="w-full">

          <thead className="border-b bg-gray-50">
            <tr>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Name
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Code
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold">
                Actions
              </th>

            </tr>
          </thead>


          <tbody>

            {subjects.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No subjects found.
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr
                  key={subject._id}
                  className="border-b last:border-b-0"
                >

                  <td className="px-4 py-3">
                    {subject.name}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {subject.code}
                  </td>

                  <td className="px-4 py-3">
                    {subject.isActive ? (
                      <span className="text-green-600">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-500">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {user?.role==="admin" && (
                      <>

                    
                    <button
  onClick={() => handleEditClick(subject)}
  className="
    rounded-lg px-3 py-1.5
    text-sm font-medium
    text-blue-500
    transition-all duration-200
    hover:bg-blue-50
    hover:text-blue-600
    active:scale-95
  "
>
  Edit
</button>

                    <button
  onClick={() => handleDeactivateSubject(subject)}
  disabled={!subject.isActive || isDeactivating}
  className="
    ml-2 rounded-lg px-3 py-1.5
    text-sm font-medium
    text-red-500
    transition-all duration-200
    hover:bg-red-50
    hover:text-red-600
    active:scale-95
    disabled:cursor-not-allowed
    disabled:text-gray-400
    disabled:hover:bg-transparent
  "
>
  {subject.isActive
    ? "Deactivate"
    : "Deactivated"}
</button>
</>  )}
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}