"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getClasses , createClass,updateClass,deactivateClass,
   getClassSubjects,assignSubjectToClass,removeSubjectFromClass,
   getSubjects,getClassSubjectTeachers,getUsers,assignTeacherToClassSubject,
   updateClassSubjectTeacher,removeClassSubjectTeacher,
} from "@/src/utils/api";
import { useRouter } from "next/navigation";
import {useAuthContext} from "@/src/context/AuthContext";

export default function ClassesPage() {
  const router = useRouter();
  const {user} =useAuthContext();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [selectedClass, setSelectedClass] = useState(null);

  const [classSubjects, setClassSubjects] = useState([]);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);

const [showAddSubject, setShowAddSubject] = useState(false);

const [selectedSubjectId, setSelectedSubjectId] = useState("");

const [addingSubject, setAddingSubject] = useState(false);

const [subjectError, setSubjectError] = useState("");
const [removingSubjectId, setRemovingSubjectId] = useState(null);

  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [teachers, setTeachers] = useState([]);

const [showTeacherModal, setShowTeacherModal] = useState(false);

const [selectedSubject, setSelectedSubject] = useState(null);

const [selectedTeacherId, setSelectedTeacherId] = useState("");

const [assigningTeacher, setAssigningTeacher] = useState(false);

const [teacherError, setTeacherError] = useState("");

 const [removingTeacherId, setRemovingTeacherId] =
  useState(null);

  const [formData, setFormData] = useState({
  name: "",
  department: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingClass, setEditingClass] = useState(null);

  const [editForm, setEditForm] = useState({
  name: "",
  department: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const handleEditClick = (classItem) => {
  setEditingClass(classItem);

  setEditForm({
    name: classItem.name,
    department: classItem.department,
  });

  setEditError("");
};

const loadSubjects = async () => {
  try {
    const data = await getSubjects();

    setAllSubjects(data);
  } catch (error) {
    console.error(
      "Failed to fetch subjects:",
      error
    );
  }
};

 const handleRemoveTeacher = async (
  assignmentId
) => {
  if (!assignmentId) return;

  const confirmed = window.confirm(
    "Remove this teacher from the subject?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setRemovingTeacherId(assignmentId);
    setTeacherError("");

    await removeClassSubjectTeacher(
      assignmentId
    );

    // Refresh assignments
    const updatedAssignments =
      await getClassSubjectTeachers(
        selectedClass._id
      );

    setTeacherAssignments(
      updatedAssignments
    );

  } catch (error) {
    console.error(
      "Failed to remove teacher:",
      error
    );

    setTeacherError(
      error?.message ||
      "Failed to remove teacher"
    );

  } finally {
    setRemovingTeacherId(null);
  }
};

 const loadTeachers = async () => {
  try {
    const response = await getUsers(1, 100);

    const teacherUsers = response.users.filter(
      (user) => user.role === "teacher"
    );

    setTeachers(teacherUsers);
  } catch (error) {
    console.error(
      "Failed to fetch teachers:",
      error
    );
  }
};

 const handleManageSubjects = async (classItem) => {
  try {
    setSelectedClass(classItem);

    setLoadingSubjects(true);
    setLoadingTeachers(true);

    setSubjectError("");

    const [subjects, teachers] =
      await Promise.all([
        getClassSubjects(classItem._id),
        getClassSubjectTeachers(classItem._id),
      ]);

    setClassSubjects(subjects);
    setTeacherAssignments(teachers);

    await loadSubjects();
    await loadTeachers();

  } catch (error) {
    console.error(
      "Failed to fetch class subjects:",
      error
    );

    setSubjectError(
      error?.message ||
      "Failed to load subjects"
    );

  } finally {
    setLoadingSubjects(false);
    setLoadingTeachers(false);
  }
};


const handleAssignTeacher = async () => {
  if (!selectedTeacherId) {
    setTeacherError("Please select a teacher");
    return;
  }

  if (!selectedClass || !selectedSubject) {
    return;
  }

  try {
    setAssigningTeacher(true);
    setTeacherError("");

    const existingAssignment =
      teacherAssignments.find(
        (assignment) =>
          assignment.subject._id ===
          selectedSubject.subject._id
      );

    if (existingAssignment) {
      // Change existing teacher
      await updateClassSubjectTeacher(
        existingAssignment._id,
        selectedTeacherId
      );
    } else {
      // Assign teacher for the first time
      await assignTeacherToClassSubject(
        selectedClass._id,
        selectedSubject.subject._id,
        selectedTeacherId
      );
    }

    // Refresh assignments
    const updatedAssignments =
      await getClassSubjectTeachers(
        selectedClass._id
      );

    setTeacherAssignments(
      updatedAssignments
    );

    setSelectedTeacherId("");
    setSelectedSubject(null);
    setShowTeacherModal(false);

  } catch (error) {
    console.error(
      "Failed to save teacher:",
      error
    );

    setTeacherError(
      error?.message ||
      "Failed to save teacher"
    );

  } finally {
    setAssigningTeacher(false);
  }
};

const handleRemoveSubject = async (subjectId) => {
  if (!selectedClass) return;
  if (
    !window.confirm(
      "Remove this subject from the class?"
    )
  ) {
    return;
  }

  try {
    setRemovingSubjectId(subjectId);
    setSubjectError("");

    await removeSubjectFromClass(
      selectedClass._id,
      subjectId
    );

    setClassSubjects((prev) =>
      prev.filter(
        (item) =>
          item.subject._id !== subjectId
      )
    );

  } catch (error) {
    console.error(
      "Failed to remove subject:",
      error
    );

    setSubjectError(
      error?.message ||
      "Failed to remove subject"
    );

  } finally {
    setRemovingSubjectId(null);
  }
};


const handleAssignSubject = async () => {
  if (!selectedSubjectId) {
    setSubjectError("Please select a subject");
    return;
  }

  try {
    setAddingSubject(true);
    setSubjectError("");

    await assignSubjectToClass(
      selectedClass._id,
      selectedSubjectId
    );

    // Fetch again so subject is populated
    const updatedSubjects =
      await getClassSubjects(selectedClass._id);

    setClassSubjects(updatedSubjects);

    setSelectedSubjectId("");
    setShowAddSubject(false);

  } catch (error) {
    console.error(
      "Failed to assign subject:",
      error
    );

    setSubjectError(
      error?.message ||
      "Failed to assign subject"
    );

  } finally {
    setAddingSubject(false);
  }
};

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getClasses();

        setClasses(data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setError("Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);


     const handleCreateClass = async () => {
     try {
    setIsSubmitting(true);
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Class name is required");
      return;
    }

    if (!formData.department.trim()) {
      setFormError("Department is required");
      return;
    }

    const newClass = await createClass({
      name: formData.name.trim(),
      department: formData.department.trim(),
    });

    setClasses((prev) => [newClass, ...prev]);

    setFormData({
      name: "",
      department: "",
    });

    setShowAddForm(false);
  } catch (error) {
    console.error("Failed to create class:", error);

    setFormError(
      error?.response?.data?.message ||
      "Failed to create class"
    );
  } finally {
    setIsSubmitting(false);
  }
};


   const handleUpdateClass = async () => {
  try {
    setIsUpdating(true);
    setEditError("");

    if (!editForm.name.trim()) {
      setEditError("Class name is required");
      return;
    }

    if (!editForm.department.trim()) {
      setEditError("Department is required");
      return;
    }

    const updatedClass = await updateClass(
      editingClass._id,
      {
        name: editForm.name.trim(),
        department: editForm.department.trim(),
      }
    );

    setClasses((prev) =>
      prev.map((item) =>
        item._id === updatedClass._id
          ? updatedClass
          : item
      )
    );

    setEditingClass(null);
  } catch (error) {
  console.error("UPDATE CLASS ERROR:", error);
  console.error("RESPONSE:", error?.response?.data);

  setEditError(
    error?.response?.data?.message ||
    error?.message ||
    "Failed to update class"
  );
} finally {
  setIsUpdating(false);
} 
}; 

  const handleDeactivateClass = async (classItem) => {
  const confirmed = window.confirm(
    `Are you sure you want to deactivate ${classItem.name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const updatedClass = await deactivateClass(classItem._id);

    setClasses((prev) =>
      prev.map((item) =>
        item._id === updatedClass._id
          ? updatedClass
          : item
      )
    );
  } catch (error) {
    console.error("Failed to deactivate class:", error);

    alert(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to deactivate class"
    );
  }
};

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Classes
        </h1>

      {user?.role==="admin" && (
        <button
          onClick={() => {
          setShowAddForm(true);
          setFormError("");
            }}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white"
           >
          + Add Class
          </button>
      )}
      </div>

      {loading && <p>Loading classes...</p>}

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      {showAddForm && (
  <div className="mb-6 rounded-xl border bg-white p-6">
    <h2 className="mb-4 text-lg font-semibold">
      Add Class
    </h2>

    {formError && (
      <p className="mb-4 text-sm text-red-500">
        {formError}
      </p>
    )}

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Class Name
        </label>

        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          placeholder="CSE-A"
          className="w-full rounded-xl border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Department
        </label>

        <input
          type="text"
          value={formData.department}
          onChange={(e) =>
            setFormData({
              ...formData,
              department: e.target.value,
            })
          }
          placeholder="CSE"
          className="w-full rounded-xl border px-4 py-2"
        />
      </div>
    </div>

    <div className="mt-5 flex gap-3">
      <button
        onClick={handleCreateClass}
        disabled={isSubmitting}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Class"}
      </button>

      <button
        onClick={() => {
          setShowAddForm(false);
          setFormData({
            name: "",
            department: "",
          });
          setFormError("");
        }}
        className="rounded-xl border px-4 py-2"
      >
        Cancel
      </button>
    </div>
  </div>
)}



      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3">Class Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((classItem) => (
                <tr
                  key={classItem._id}
                  className="border-b"
                >
                  <td className="px-4 py-3">
                    {classItem.name}
                  </td>

                  <td className="px-4 py-3">
                    {classItem.department}
                  </td>

                  <td className="px-4 py-3">
                    {classItem.isActive ? "Active" : "Inactive"}
                  </td>

                  <td className="px-4 py-3">

                    <button
  onClick={() => router.push(`/dashboard/classes/${classItem._id}`)}
  className="
    rounded-lg px-3 py-1.5 text-sm font-medium
    text-green-600
    transition-all duration-200
    hover:bg-green-50
    hover:text-green-700
    active:scale-95
  "
>
  View
</button>
{user?.role==="admin" && (
  <>
                     <button
  onClick={() => handleEditClick(classItem)}
  className="
    rounded-lg px-3 py-1.5 text-sm font-medium
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
  onClick={() => handleManageSubjects(classItem)}
  className="
    ml-2 rounded-lg px-3 py-1.5
    text-sm font-medium
    text-blue-600
    transition-all duration-200
    hover:bg-blue-50
    active:scale-95
  "
>
  Manage Subjects
</button>
<button
  onClick={() => handleDeactivateClass(classItem)}
  disabled={!classItem.isActive}
  className="
    rounded-lg px-3 py-1.5 text-sm font-medium
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
  {classItem.isActive ? "Deactivate" : "Deactivated"}
</button>
</>
)}

        
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {user?.role==="admin" && showAddSubject && (
  <div className="mb-5 rounded-lg border bg-gray-50 p-4">

    <h3 className="mb-3 font-medium">
      Add Subject to {selectedClass.name}
    </h3>

    {subjectError && (
      <p className="mb-3 text-sm text-red-500">
        {subjectError}
      </p>
    )}

    <select
      value={selectedSubjectId}
      onChange={(e) =>
        setSelectedSubjectId(e.target.value)
      }
      className="
        w-full rounded-lg border
        bg-white px-4 py-2
        outline-none
        focus:ring-2
      "
    >
      <option value="">
        Select a subject
      </option>

      {allSubjects
        .filter((subject) => subject.isActive)
        .filter(
          (subject) =>
            !classSubjects.some(
              (item) =>
                item.subject._id === subject._id
            )
        )
        .map((subject) => (
          <option
            key={subject._id}
            value={subject._id}
          >
            {subject.name} ({subject.code})
          </option>
        ))}
    </select>

    <div className="mt-3 flex gap-2">

      <button
        onClick={handleAssignSubject}
        disabled={addingSubject}
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
        {addingSubject
          ? "Assigning..."
          : "Assign Subject"}
      </button>

      <button
        onClick={() => {
          setShowAddSubject(false);
          setSelectedSubjectId("");
          setSubjectError("");
        }}
        disabled={addingSubject}
        className="
          rounded-lg border px-4 py-2
          text-sm
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

      { user?.role==="admin" &&selectedClass && (
  <div className="mt-6 rounded-xl border bg-white p-6">

    <div className="mb-5 flex items-center justify-between">

      <div>
        <h2 className="text-lg font-semibold">
          Subjects for {selectedClass.name}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage subjects assigned to this class
        </p>
      </div>

      <div className="flex gap-2">

  <button
    onClick={() => {
      setShowAddSubject(true);
      setSubjectError("");
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

  <button
    onClick={() => {
      setSelectedClass(null);
      setClassSubjects([]);
      setShowAddSubject(false);
      setSelectedSubjectId("");
    }}
    className="
      rounded-lg border px-3 py-1.5
      text-sm
      transition-all duration-200
      hover:bg-gray-100
      active:scale-95
    "
  >
    Close
  </button>

</div>

    </div>


    {loadingSubjects ? (
      <p className="text-sm text-gray-500">
        Loading subjects...
      </p>
    ) : classSubjects.length === 0 ? (
      <p className="text-sm text-gray-500">
        No subjects assigned to this class.
      </p>
    ) : (
      <div className="space-y-2">

       {classSubjects.map((item) => {
  const assignment = teacherAssignments.find(
    (assignment) =>
      assignment.subject._id === item.subject._id
  );

  return (
    <div
      key={item._id}
      className="
        flex items-center justify-between
        rounded-lg border p-3
      "
    >

      <div>
        <p className="font-medium">
          {item.subject.name}
        </p>

        <p className="text-sm text-gray-500">
          {item.subject.code}
        </p>

        <p className="mt-1 text-sm">
          {assignment ? (
            <>
              Teacher:{" "}
              <span className="font-medium">
                {assignment.teacher.name}
              </span>
            </>
          ) : (
            <span className="text-gray-400">
              No teacher assigned
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-2">

        <button
  onClick={() => {
    setSelectedSubject(item);
    setSelectedTeacherId(
      assignment?.teacher?._id || ""
    );
    setTeacherError("");
    setShowTeacherModal(true);
  }}
  className="
    rounded-lg bg-blue-600 px-3 py-1.5
    text-sm font-medium text-white
    transition-all duration-200
    hover:bg-blue-700
    active:scale-95
  "
>
  {assignment
    ? "Change Teacher"
    : "Assign Teacher"}
</button>

{assignment && (
  <button
    onClick={() =>
      handleRemoveTeacher(
        assignment._id
      )
    }
    disabled={
      removingTeacherId ===
      assignment._id
    }
    className="
      rounded-lg px-3 py-1.5
      text-sm font-medium
      text-orange-600
      transition-all duration-200
      hover:bg-orange-50
      hover:text-orange-700
      active:scale-95
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    {removingTeacherId ===
    assignment._id
      ? "Removing..."
      : "Remove Teacher"}
  </button>
)}

        <button
          onClick={() =>
            handleRemoveSubject(
              item.subject._id
            )
          }
          disabled={
            removingSubjectId ===
            item.subject._id
          }
          className="
            rounded-lg px-3 py-1.5
            text-sm font-medium
            text-red-500
            transition-all duration-200
            hover:bg-red-50
            hover:text-red-600
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {removingSubjectId ===
          item.subject._id
            ? "Removing..."
            : "Remove"}
        </button>

      </div>

    </div>
  );
})}

       
        
      </div>
    )}
  </div>
)}

{showTeacherModal && selectedSubject && (
  <div className="
    fixed inset-0 z-50
    flex items-center justify-center
    bg-black/40
    p-4
  ">

    <div className="
      w-full max-w-md
      rounded-xl bg-white
      p-6 shadow-xl
    ">

      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          {teacherAssignments.some(
            (item) =>
              item.subject._id ===
              selectedSubject.subject._id
          )
            ? "Change Teacher"
            : "Assign Teacher"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {selectedSubject.subject.name}
          {" "}
          ({selectedSubject.subject.code})
        </p>
      </div>


      {teacherError && (
        <p className="
          mb-3 rounded-lg
          bg-red-50 p-3
          text-sm text-red-600
        ">
          {teacherError}
        </p>
      )}


      <label className="
        mb-2 block
        text-sm font-medium
      ">
        Teacher
      </label>

      <select
        value={selectedTeacherId}
        onChange={(e) =>
          setSelectedTeacherId(e.target.value)
        }
        className="
          w-full rounded-lg border
          bg-white px-4 py-2.5
          outline-none
        "
      >
        <option value="">
          Select a teacher
        </option>

        {teachers.map((teacher) => (
          <option
            key={teacher._id}
            value={teacher._id}
          >
            {teacher.name} ({teacher.email})
          </option>
        ))}
      </select>


      <div className="
        mt-5 flex justify-end gap-2
      ">

        <button
          onClick={() => {
            setShowTeacherModal(false);
            setSelectedSubject(null);
            setSelectedTeacherId("");
            setTeacherError("");
          }}
          disabled={assigningTeacher}
          className="
            rounded-lg border
            px-4 py-2
            text-sm
            transition-all duration-200
            hover:bg-gray-100
            active:scale-95
          "
        >
          Cancel
        </button>

        <button
          onClick={handleAssignTeacher}
          disabled={assigningTeacher}
          className="
            rounded-lg bg-blue-600
            px-4 py-2
            text-sm font-medium text-white
            transition-all duration-200
            hover:bg-blue-700
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {assigningTeacher
            ? "Saving..."
            : "Save Teacher"}
        </button>

      </div>

    </div>

  </div>
)}

        { user?.role==="admin" && editingClass && (
  <div className="mb-6 rounded-xl border bg-white p-6">
    <h2 className="mb-4 text-lg font-semibold">
      Edit Class
    </h2>

    {editError && (
      <p className="mb-4 text-sm text-red-500">
        {editError}
      </p>
    )}

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Class Name
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
          className="w-full rounded-xl border px-4 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Department
        </label>

        <input
          type="text"
          value={editForm.department}
          onChange={(e) =>
            setEditForm({
              ...editForm,
              department: e.target.value,
            })
          }
          className="w-full rounded-xl border px-4 py-2"
        />
      </div>
    </div>

    <div className="mt-5 flex gap-3">
      <button
        onClick={handleUpdateClass}
        disabled={isUpdating}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isUpdating ? "Updating..." : "Update Class"}
      </button>

      <button
        onClick={() => {
          setEditingClass(null);
          setEditError("");
        }}
        className="rounded-xl border px-4 py-2"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      {!loading && !error && classes.length === 0 && (
        <p className="mt-6 text-gray-500">
          No classes found.
        </p>
      )}
    </div>
  );
}