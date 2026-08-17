import { API_BASE_URL } from "./constants";

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // Field-level validation errors: [{ field, message }]
    this.errors = errors;
  }
}

let accessToken = null;
// Endpoints that must never trigger a refresh-and-retry loop.
const AUTH_ENDPOINTS = ["/auth/refresh-token", "/auth/login", "/auth/logout"];

export const setAccessToken = (token) => {
  accessToken = token;
};

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const rawRequest = async (endpoint, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      credentials: "include",
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  const body = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      body?.message || `Request failed with status ${response.status}`,
      response.status,
      body?.errors || []
    );
  }

  return body;
};

// A single in-flight refresh shared by every 401 so a burst of parallel requests
// doesn't rotate the refresh token N times.
let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = rawRequest("/auth/refresh-token", { method: "POST" })
      .then((res) => {
        setAccessToken(res?.data?.accessToken || null);
        return true;
      })
      .catch(() => {
        setAccessToken(null);
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const request = async (endpoint, options = {}) => {
  try {
    return await rawRequest(endpoint, options);
  } catch (error) {
    const canRetry =
      error instanceof ApiError &&
      error.status === 401 &&
      !AUTH_ENDPOINTS.includes(endpoint) &&
      !options._retried;

    if (!canRetry) throw error;

    const refreshed = await refreshSession();
    // Surface the original 401 rather than a confusing "refresh token missing".
    if (!refreshed) throw error;

    return rawRequest(endpoint, { ...options, _retried: true });
  }
};

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) => request(endpoint, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: (endpoint, body) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export async function forgetPassword(email) {
  const response = await api.post("/auth/forget-password", { email });
  return response.data;
}

export async function resetPassword({ token, newPassword }) {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
}

export async function verifyEmail(token) {
  const response = await api.post("/auth/verify-email", { token });
  return response.data;
}

export async function resendVerification(email) {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
}

export const getUsers = async (currentPage = 1 ,role="all" , search="") => {
  const response = await api.get(
    `/users?page=${currentPage}&limit=10&role=${role}&search=${encodeURIComponent(search)}`
  );

  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await api.patch(`/users/${id}/deactivate`);
  return response.data;
};

export const addUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const getClasses = async () => {
  const response = await api.get("/classes");
  return response.data;
};

export const createClass = async (classData) => {
  const response = await api.post("/classes", classData);

  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await api.patch(`/classes/${id}`, classData);

  return response.data;
};

export const deactivateClass = async (id) => {
  const response = await api.patch(`/classes/${id}/deactivate`);

  return response.data;
};

export const getClassById = async (id) => {
  const response = await api.get(`/classes/${id}`);

  return response.data;
};

export const getSubjects = async () => {
  const response = await api.get("/subjects");

  console.log("SUBJECTS RESPONSE:", response.data);

  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await api.post(
    "/subjects",
    subjectData
  );

  return response.data;
};

export const updateSubject = async (id, subjectData) => {
  const response = await api.patch(
    `/subjects/${id}`,
    subjectData
  );

  return response.data;
};

export const deactivateSubject = async (id) => {
  const response = await api.patch(
    `/subjects/${id}/deactivate`
  );

  return response.data;
};

export const getClassSubjects = async (classId) => {
  const response = await api.get(
    `/class-subjects/class/${classId}`
  );

  console.log(
    "CLASS SUBJECTS RESPONSE:",
    response.data
  );

  return response.data;
};


export const assignSubjectToClass = async (
  classId,
  subjectId
) => {
  const response = await api.post(
    "/class-subjects",
    {
      classId,
      subjectId,
    }
  );

  return response.data;
};


export const removeSubjectFromClass = async (
  classId,
  subjectId
) => {
  const response = await api.delete(
    `/class-subjects/${classId}/${subjectId}`
  );

  return response.data;
};

export const getClassSubjectTeachers = async (classId) => {
  const response = await api.get(
    `/class-subject-teachers/class/${classId}`
  );

  return response.data;
};

export const assignTeacherToClassSubject = async (
  classId,
  subjectId,
  teacherId
) => {
  const response = await api.post(
    "/class-subject-teachers",
    {
      classId,
      subjectId,
      teacherId,
    }
  );

  return response.data;
};

export const updateClassSubjectTeacher = async (
  assignmentId,
  teacherId
) => {
  const response = await api.patch(
    `/class-subject-teachers/${assignmentId}`,
    {
      teacherId,
    }
  );

  return response.data;
};

export const removeClassSubjectTeacher = async (
  assignmentId
) => {
  const response = await api.delete(
    `/class-subject-teachers/${assignmentId}`
  );

  return response.data;
};